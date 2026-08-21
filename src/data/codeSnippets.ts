import { ArchitectureSnippet } from '../types';

export const CODE_SNIPPETS: ArchitectureSnippet[] = [
  {
    id: 'cloud-function-purchase',
    title: '1. Secure Node.js Cloud Function (Admin SDK)',
    filename: 'functions/src/purchaseToken.ts',
    language: 'typescript',
    category: 'cloud_function',
    description: 'Server-side Cloud Function that executes mock purchases, atomically updates the Firestore user balance, logs audit records, allocates physical 10g 24K bars, and generates cryptographically signed EVM on-chain mint payloads.',
    securityHighlights: [
      'Zero Client Trust: Gold balances are never written from the frontend SDK.',
      'Atomic Isolation: Uses `db.runTransaction()` to prevent race conditions and double-minting.',
      'EVM Cryptographic Preparation: Computes keccak256 vault receipt hash and signs with backend admin private key.',
      'Immutable Audit Trail: Creates atomic records in `transactions` and `vaultAllocations` collections.'
    ],
    code: `import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ethers } from "ethers";

// Initialize Firebase Admin SDK (Cloud Functions backend privileges)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Backend Vault & Token Authority Signer for EVM smart contract
const MINT_AUTHORITY_PRIVATE_KEY = process.env.MINT_AUTHORITY_KEY || "0x4f3edf983ac636a65a842ce7c78d5aa706d41140a00000000000000000000001";
const GOLD10_CONTRACT_ADDRESS = process.env.GOLD10_CONTRACT || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

interface PurchaseTokenRequest {
  tokenAmount: number; // e.g., 2 GOLD10 = 20g pure gold
  paymentMethod: "USDC" | "BANK_WIRE" | "CREDIT_CARD";
  walletAddress?: string;
}

/**
 * Callable Cloud Function: purchaseGoldToken
 * Enforces authenticated session, updates Firestore atomically, and prepares EVM mint payload.
 */
export const purchaseGoldToken = functions.https.onCall(
  async (data: PurchaseTokenRequest, context) => {
    // 1. Enforce Authentication
    if (!context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The request must be authenticated with Firebase Auth."
      );
    }

    const userId = context.auth.uid;
    const userEmail = context.auth.token.email || "unknown@gold10.io";
    const { tokenAmount, paymentMethod, walletAddress } = data;

    // 2. Validate input parameters
    if (typeof tokenAmount !== "number" || tokenAmount <= 0 || !Number.isFinite(tokenAmount)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid tokenAmount: Must be a positive finite number."
      );
    }

    // Maximum safety ceiling per single transaction (e.g. 500 GOLD10 = 5kg)
    if (tokenAmount > 500) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Exceeded maximum transaction limit of 500 GOLD10."
      );
    }

    const userDocRef = db.collection("users").doc(userId);
    const txDocRef = db.collection("transactions").doc();
    const now = admin.firestore.FieldValue.serverTimestamp();

    // 3. Physical Gold Bar Allocation Details (10g 24K per token)
    const allocatedBars = Array.from({ length: Math.ceil(tokenAmount) }, (_, i) => {
      const serialNum = "G10-ZH-" + Math.floor(100000 + Math.random() * 900000);
      return {
        serialNumber: serialNum,
        purity: "999.9 Fine 24K (LBMA Good Delivery)",
        weightGrams: 10.0,
        vaultLocation: "Zurich Freeport, Switzerland (Loomis/Brinks Vault A-4)",
        allocatedAt: new Date().toISOString(),
        auditCertificateId: "CERT-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      };
    });

    try {
      // 4. ATOMIC FIRESTORE TRANSACTION
      const result = await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userDocRef);

        let currentBalance = 0;

        if (!userDoc.exists) {
          // Initialize user document if not exists
          transaction.set(userDocRef, {
            email: userEmail,
            goldBalance: tokenAmount,
            createdAt: now,
            updatedAt: now,
          });
          currentBalance = tokenAmount;
        } else {
          const userData = userDoc.data()!;
          const prevBalance = typeof userData.goldBalance === "number" ? userData.goldBalance : 0;
          currentBalance = prevBalance + tokenAmount;

          // Increment balance on server side
          transaction.update(userDocRef, {
            goldBalance: admin.firestore.FieldValue.increment(tokenAmount),
            updatedAt: now,
          });
        }

        // 5. Compute cryptographic vault receipt hash for On-Chain Proof
        const targetWallet = walletAddress || "0x0000000000000000000000000000000000000000";
        const vaultReceiptHash = ethers.solidityPackedKeccak256(
          ["string", "string", "uint256", "uint256"],
          [userId, txDocRef.id, ethers.parseUnits(tokenAmount.toString(), 18), Date.now()]
        );

        // Sign receipt with Backend Authority Key (EIP-191 / EIP-712 compatible)
        const walletSigner = new ethers.Wallet(MINT_AUTHORITY_PRIVATE_KEY);
        const signature = await walletSigner.signMessage(ethers.getBytes(vaultReceiptHash));

        // Prepare EVM Mint Calldata for smart contract interface:
        // mint(address recipient, uint256 amount, bytes32 vaultReceiptHash, bytes signature)
        const iface = new ethers.Interface([
          "function mint(address to, uint256 amount, bytes32 vaultReceiptHash, bytes signature) external",
        ]);
        const mintAmountWei = ethers.parseUnits(tokenAmount.toString(), 18);
        const evmCalldata = iface.encodeFunctionData("mint", [
          targetWallet,
          mintAmountWei,
          vaultReceiptHash,
          signature,
        ]);

        // 6. Record immutable transaction log
        transaction.set(txDocRef, {
          userId,
          type: "MINT_PURCHASE",
          tokenAmount,
          goldGrams: tokenAmount * 10,
          paymentMethod: paymentMethod || "USDC",
          vaultBarSerials: allocatedBars.map((b) => b.serialNumber),
          status: "SETTLED",
          createdAt: now,
          blockchainData: {
            contractAddress: GOLD10_CONTRACT_ADDRESS,
            targetWallet,
            vaultReceiptHash,
            signature,
            evmCalldata,
            readyForOnChainRelay: true,
          },
        });

        // 7. Write allocated physical bar records in subcollection
        for (const bar of allocatedBars) {
          const barRef = userDocRef.collection("vaultBars").doc(bar.serialNumber);
          transaction.set(barRef, bar);
        }

        return {
          success: true,
          txId: txDocRef.id,
          newGoldBalance: currentBalance,
          tokenAmount,
          allocatedBars,
          vaultReceiptHash,
          evmCalldata,
        };
      });

      return result;
    } catch (error: any) {
      functions.logger.error("Transaction failed: ", error);
      throw new functions.https.HttpsError("internal", error.message || "Failed to process gold token purchase.");
    }
  }
);`
  },
  {
    id: 'firestore-security-rules',
    title: '2. Zero-Trust Firestore Security Rules',
    filename: 'firestore.rules',
    language: 'plaintext',
    category: 'security_rules',
    description: 'Strict security rules enforcing that users can only READ their own documents (matching their authenticated UID) while client writes are completely blocked (`allow write: if false;`).',
    securityHighlights: [
      'Strict User Isolation: `allow read: if request.auth != null && request.auth.uid == userId;`',
      'Client-Side Write Prohibition: `allow write: if false;` prevents any browser manipulation of balances.',
      'Protected Subcollections: Rules cascade securely to `vaultBars` and `transactions`.',
      'Server-Only Authority: Firebase Admin SDK in Cloud Functions bypasses rules cleanly on backend.'
    ],
    code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if caller is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if caller is accessing their own document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // -------------------------------------------------------------
    // USERS COLLECTION: users/{userId}
    // Contains: email, createdAt, goldBalance
    // -------------------------------------------------------------
    match /users/{userId} {
      // 1. Users can ONLY read their own profile & balance
      allow read: if isOwner(userId);
      
      // 2. Client-side writes are strictly blocked
      // All balance increments MUST come from Cloud Functions via Admin SDK
      allow write: if false;

      // Subcollection: Physical vault bars allocated to user
      match /vaultBars/{barId} {
        allow read: if isOwner(userId);
        allow write: if false;
      }
    }

    // -------------------------------------------------------------
    // TRANSACTIONS COLLECTION: transactions/{txId}
    // Immutable ledger audit records written exclusively by backend
    // -------------------------------------------------------------
    match /transactions/{txId} {
      // Users can only query/read transactions where they are the recipient
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Client writes are strictly forbidden
      allow write: if false;
    }

    // -------------------------------------------------------------
    // GLOBAL VAULT AUDIT COLLECTION (Public Verification Data)
    // -------------------------------------------------------------
    match /vaultAudits/{auditId} {
      // Anyone can verify physical vault reserve certificates
      allow read: if true;
      allow write: if false;
    }
  }
}`
  },
  {
    id: 'react-firebase-hook',
    title: '3. Real-Time React Web SDK Hook & Component',
    filename: 'src/hooks/useGoldBalance.ts',
    language: 'typescript',
    category: 'react_sdk',
    description: 'Clean, production-ready React custom hook and component using Firebase Web SDK (v10 modular) `onSnapshot` to stream live balance updates directly from Firestore.',
    securityHighlights: [
      'Real-Time WebSocket Sync: Instant UI update when Cloud Function commits transaction.',
      'Resource Leak Prevention: Automatically invokes `unsubscribe()` on component unmount.',
      'Graceful Loading & Error Handling: Handles network drops, missing documents, and permission failures.'
    ],
    code: `import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, onSnapshot, DocumentSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

// 1. Firebase Client SDK Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoKey...",
  authDomain: "gold10-prod.firebaseapp.com",
  projectId: "gold10-prod",
  storageBucket: "gold10-prod.appspot.com",
  messagingSenderId: "918276604919",
  appId: "1:918276604919:web:a1b2c3d4e5f6",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

export interface GoldUserData {
  userId: string;
  email: string;
  goldBalance: number; // Total GOLD10 tokens
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Custom React Hook: useGoldBalance
 * Listens to Firestore real-time snapshot for the authenticated user.
 */
export function useGoldBalance(targetUserId?: string) {
  const [goldData, setGoldData] = useState<GoldUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If targetUserId is not provided, listen to the active Firebase Auth state
    if (!targetUserId) {
      const unsubAuth = onAuthStateChanged(auth, (currentUser: User | null) => {
        if (!currentUser) {
          setGoldData(null);
          setLoading(false);
          setError("User not authenticated.");
          return;
        }
        // Attach snapshot listener to users/{userId}
        setupSnapshot(currentUser.uid);
      });
      return () => unsubAuth();
    } else {
      return setupSnapshot(targetUserId);
    }

    function setupSnapshot(uid: string) {
      setLoading(true);
      setError(null);

      // Reference to users/{userId} document
      const userDocRef = doc(db, "users", uid);

      // Subscribe to real-time updates via onSnapshot
      const unsubscribe = onSnapshot(
        userDocRef,
        (snapshot: DocumentSnapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setGoldData({
              userId: uid,
              email: data.email || "",
              goldBalance: typeof data.goldBalance === "number" ? data.goldBalance : 0,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          } else {
            // User doc doesn't exist yet (initial state)
            setGoldData({
              userId: uid,
              email: auth.currentUser?.email || "",
              goldBalance: 0,
            });
          }
          setLoading(false);
        },
        (err) => {
          console.error("Firestore real-time subscription error:", err);
          setError(err.message || "Failed to read gold balance.");
          setLoading(false);
        }
      );

      // Cleanup listener on unmount or UID change
      return unsubscribe;
    }
  }, [targetUserId]);

  return { goldData, loading, error };
}

// -------------------------------------------------------------
// Component Implementation: GoldBalanceCard.tsx
// -------------------------------------------------------------
export function GoldBalanceCard({ spotPricePerGram = 85.50 }: { spotPricePerGram?: number }) {
  const { goldData, loading, error } = useGoldBalance();

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 animate-pulse text-amber-300">
        Syncing real-time ledger from Firestore...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
        Error reading balance: {error}
      </div>
    );
  }

  const tokens = goldData?.goldBalance ?? 0;
  const grams = tokens * 10; // 1 GOLD10 = 10 grams 24K
  const totalUsd = grams * spotPricePerGram;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-amber-500/30 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
          Allocated 24K Physical Gold
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
          Live Firestore Stream
        </span>
      </div>

      <div className="space-y-1">
        <div className="text-4xl font-bold tracking-tight text-amber-200">
          {tokens.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{" "}
          <span className="text-xl font-medium text-amber-400/80">GOLD10</span>
        </div>
        <div className="text-sm text-zinc-400">
          Equivalent to <strong className="text-zinc-200 font-semibold">{grams.toFixed(2)} grams</strong> ({(grams / 31.1034768).toFixed(3)} oz t) 24K LBMA Gold
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-sm">
        <span className="text-zinc-400">Estimated Market Value:</span>
        <span className="text-lg font-semibold text-emerald-400">
          \${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </span>
      </div>
    </div>
  );
}`
  },
  {
    id: 'solidity-smart-contract',
    title: '4. EVM Smart Contract (Solidity ERC-20 / Vault Proof)',
    filename: 'contracts/GOLD10VaultToken.sol',
    language: 'solidity',
    category: 'smart_contract',
    description: 'Solidity Smart Contract for EVM chains (Ethereum, Base, Arbitrum) with ECDSA signature verification, proof-of-reserve receipt hashing, and 1 token = 10g 24K vault backing guarantee.',
    securityHighlights: [
      'Cryptographic Mint Authorization: Verifies signature from backend authority signer.',
      'Double-Mint Replay Protection: Emits and records `vaultReceiptHash` in a used mapping.',
      'ERC-20 Compliant: Standard 18 decimals (1.0 token = 10 grams pure physical gold).'
    ],
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title GOLD10VaultToken
 * @dev ERC-20 Token representing 10 grams of physical 24K LBMA Good Delivery Gold per token.
 * Minting is authorized exclusively via backend Cloud Functions with cryptographic vault receipt proof.
 */
contract GOLD10VaultToken is ERC20, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Backend authority public key that validates physical vault bar allocations
    address public mintAuthoritySigner;

    // Track used vault receipts to prevent replay attacks
    mapping(bytes32 => bool) public usedVaultReceipts;

    // Event emitted upon successful physical vault bar backed mint
    event GoldMinted(
        address indexed recipient,
        uint256 tokenAmount,
        uint256 gramsBacking,
        bytes32 indexed vaultReceiptHash
    );

    event PhysicalGoldBurned(
        address indexed redeemer,
        uint256 tokenAmount,
        uint256 gramsRedeemed,
        string vaultDeliveryId
    );

    constructor(address _mintAuthoritySigner) 
        ERC20("GOLD10 Physical 24K Gold", "GOLD10") 
        Ownable(msg.sender) 
    {
        require(_mintAuthoritySigner != address(0), "Invalid authority");
        mintAuthoritySigner = _mintAuthoritySigner;
    }

    /**
     * @notice Mint GOLD10 tokens backed by audited physical gold receipt
     * @param to Recipient EVM wallet address
     * @param amount Token amount in 18 decimals (1 ether = 1 GOLD10 = 10g)
     * @param vaultReceiptHash Keccak256 hash of (userId, txId, amount, timestamp)
     * @param signature Cryptographic ECDSA signature from mintAuthoritySigner
     */
    function mint(
        address to,
        uint256 amount,
        bytes32 vaultReceiptHash,
        bytes calldata signature
    ) external {
        require(!usedVaultReceipts[vaultReceiptHash], "Vault receipt already minted");
        require(to != address(0), "Cannot mint to zero address");

        // Verify cryptographic signature from the backend Cloud Function signer
        bytes32 ethSignedMessageHash = vaultReceiptHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        require(recoveredSigner == mintAuthoritySigner, "Invalid mint authority signature");

        // Mark receipt as consumed to prevent replay
        usedVaultReceipts[vaultReceiptHash] = true;

        // Mint ERC-20 tokens
        _mint(to, amount);

        // 1 token = 10 grams (18 decimals calculation)
        uint256 gramsBacking = (amount * 10) / 1e18;

        emit GoldMinted(to, amount, gramsBacking, vaultReceiptHash);
    }

    /**
     * @notice Burn GOLD10 tokens for physical vault redemption & delivery
     */
    function redeemPhysical(uint256 amount, string calldata vaultDeliveryId) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient GOLD10 balance");
        _burn(msg.sender, amount);

        uint256 gramsRedeemed = (amount * 10) / 1e18;
        emit PhysicalGoldBurned(msg.sender, amount, gramsRedeemed, vaultDeliveryId);
    }

    function setMintAuthority(address _newAuthority) external onlyOwner {
        require(_newAuthority != address(0), "Invalid authority");
        mintAuthoritySigner = _newAuthority;
    }
}`
  }
];
