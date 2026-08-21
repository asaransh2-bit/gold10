```tsx
import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

import { Header } from "./components/Header";
import { PriceTicker } from "./components/PriceTicker";
import { PortfolioOverview } from "./components/PortfolioOverview";
import { PurchaseTerminal } from "./components/PurchaseTerminal";
import { BlockchainExplorer } from "./components/BlockchainExplorer";
import { ArchitectureView } from "./components/ArchitectureView";
import { PhysicalRedemptionModal } from "./components/PhysicalRedemptionModal";
import { TransferModal } from "./components/TransferModal";

import {
  UserProfile,
  VaultBar,
  TransactionRecord,
  GoldSpotData,
} from "./types";

const DEFAULT_SPOT: GoldSpotData = {
  pricePerGram: 110,
  currency: "USD",
  updatedAt: new Date().toISOString(),
  source: "GOLD10 reference price",
};

const DEFAULT_USER: UserProfile = {
  userId: "",
  name: "GOLD10 User",
  email: "",
  walletAddress: "",
  goldBalance: 0,
  usdBalance: 0,
  status: "pending",
};

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentUser, setCurrentUser] =
    useState<UserProfile>(DEFAULT_USER);

  const [allUsers, setAllUsers] =
    useState<UserProfile[]>([]);

  const [userBars, setUserBars] =
    useState<VaultBar[]>([]);

  const [transactions, setTransactions] =
    useState<TransactionRecord[]>([]);

  const [spotData, setSpotData] =
    useState<GoldSpotData>(DEFAULT_SPOT);

  const [activeTab, setActiveTab] =
    useState<
      "dashboard" |
      "purchase" |
      "blockchain" |
      "architecture" |
      "vault"
    >("dashboard");

  const [showRedeemModal, setShowRedeemModal] =
    useState(false);

  const [showTransferModal, setShowTransferModal] =
    useState(false);

  /* =========================================================
     LOGIN STATE
  ========================================================= */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isRegistering, setIsRegistering] =
    useState(false);

  const [loginLoading, setLoginLoading] =
    useState(false);

  const [loginError, setLoginError] =
    useState("");

  /* =========================================================
     FIREBASE AUTH
  ========================================================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setFirebaseUser(user);
        setAuthLoading(false);

        if (!user) {
          setCurrentUser(DEFAULT_USER);
          setProfileLoading(false);
        } else {
          setProfileLoading(true);
        }
      },
      (error) => {
        console.error("Authentication error:", error);

        setFirebaseUser(null);
        setAuthLoading(false);
        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================================
     LOGIN / REGISTER
  ========================================================= */

  const handleAuthentication = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setLoginError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setLoginError(
        "Please enter your email and password."
      );
      return;
    }

    if (password.length < 6) {
      setLoginError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoginLoading(true);

      if (isRegistering) {
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
      }
    } catch (error: any) {
      console.error("Authentication failed:", error);

      let message =
        "Unable to sign in. Please try again.";

      switch (error?.code) {
        case "auth/invalid-credential":
          message =
            "Invalid email or password.";
          break;

        case "auth/user-not-found":
          message =
            "No account exists with this email.";
          break;

        case "auth/wrong-password":
          message =
            "Incorrect password.";
          break;

        case "auth/email-already-in-use":
          message =
            "An account already exists with this email.";
          break;

        case "auth/invalid-email":
          message =
            "Please enter a valid email address.";
          break;

        case "auth/weak-password":
          message =
            "Password must contain at least 6 characters.";
          break;

        case "auth/too-many-requests":
          message =
            "Too many attempts. Please wait and try again.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection.";
          break;

        default:
          message =
            error?.message ||
            "Authentication failed.";
      }

      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  /* =========================================================
     USER PROFILE
  ========================================================= */

  useEffect(() => {
    if (!firebaseUser) return;

    const userRef = doc(
      db,
      "users",
      firebaseUser.uid
    );

    const unsubscribe = onSnapshot(
      userRef,
      async (snapshot) => {
        try {
          if (!snapshot.exists()) {
            const profile: UserProfile = {
              userId: firebaseUser.uid,

              name:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "GOLD10 User",

              email:
                firebaseUser.email || "",

              walletAddress: "",

              goldBalance: 0,

              usdBalance: 0,

              status: "active",

              createdAt:
                new Date().toISOString(),

              updatedAt:
                new Date().toISOString(),
            };

            await setDoc(userRef, {
              ...profile,

              createdAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            });

            setCurrentUser(profile);
          } else {
            const data = snapshot.data();

            const profile: UserProfile = {
              userId:
                data.userId ||
                firebaseUser.uid,

              name:
                data.name ||
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "GOLD10 User",

              email:
                data.email ||
                firebaseUser.email ||
                "",

              walletAddress:
                data.walletAddress || "",

              goldBalance:
                typeof data.goldBalance === "number"
                  ? data.goldBalance
                  : 0,

              usdBalance:
                typeof data.usdBalance === "number"
                  ? data.usdBalance
                  : 0,

              status:
                data.status || "active",

              createdAt:
                data.createdAt
                  ?.toDate?.()
                  ?.toISOString?.() ||
                data.createdAt,

              updatedAt:
                data.updatedAt
                  ?.toDate?.()
                  ?.toISOString?.() ||
                data.updatedAt,
            };

            setCurrentUser(profile);
          }

          setProfileLoading(false);
        } catch (error) {
          console.error(
            "Unable to load user profile:",
            error
          );

          setProfileLoading(false);
        }
      },
      (error) => {
        console.error(
          "User profile listener:",
          error
        );

        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  /* =========================================================
     USER VAULT BARS
  ========================================================= */

  useEffect(() => {
    if (!firebaseUser) {
      setUserBars([]);
      return;
    }

    const barsRef = collection(
      db,
      "users",
      firebaseUser.uid,
      "vaultBars"
    );

    const unsubscribe = onSnapshot(
      barsRef,
      (snapshot) => {
        const bars: VaultBar[] =
          snapshot.docs.map((item) => {
            const data = item.data();

            return {
              id:
                data.id ||
                item.id,

              serialNumber:
                data.serialNumber ||
                "",

              vaultLocation:
                data.vaultLocation ||
                "",

              vaultProvider:
                data.vaultProvider ||
                "",

              auditCertificateId:
                data.auditCertificateId ||
                "",

              weightGrams:
                Number(
                  data.weightGrams || 0
                ),

              purity:
                data.purity ||
                "999.9",

              status:
                data.status ||
                "available",

              allocatedGold10:
                Number(
                  data.allocatedGold10 || 0
                ),

              createdAt:
                data.createdAt
                  ?.toDate?.()
                  ?.toISOString?.() ||
                data.createdAt,

              updatedAt:
                data.updatedAt
                  ?.toDate?.()
                  ?.toISOString?.() ||
                data.updatedAt,
            };
          });

        setUserBars(bars);
      },
      (error) => {
        console.error(
          "Vault bar listener:",
          error
        );

        setUserBars([]);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  /* =========================================================
     TRANSACTIONS
  ========================================================= */

  useEffect(() => {
    if (!firebaseUser) {
      setTransactions([]);
      return;
    }

    const transactionsRef = collection(
      db,
      "users",
      firebaseUser.uid,
      "transactions"
    );

    const transactionQuery = query(
      transactionsRef,
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      transactionQuery,
      (snapshot) => {
        const records: TransactionRecord[] =
          snapshot.docs.map((item) => {
            const data = item.data();

            return {
              id:
                data.id ||
                item.id,

              userId:
                data.userId ||
                firebaseUser.uid,

              timestamp:
                data.timestamp
                  ?.toDate?.()
                  ?.toISOString?.() ||
                data.timestamp ||
                new Date().toISOString(),

              type:
                data.type ||
                "GOLD10_PURCHASE",

              tokenAmount:
                Number(
                  data.tokenAmount || 0
                ),

              goldGrams:
                Number(
                  data.goldGrams || 0
                ),

              status:
                data.status ||
                "pending",

              fromUserId:
                data.fromUserId,

              toUserId:
                data.toUserId,

              fromWallet:
                data.fromWallet,

              toWallet:
                data.toWallet,

              totalUsd:
                typeof data.totalUsd ===
                "number"
                  ? data.totalUsd
                  : undefined,

              feeUsd:
                typeof data.feeUsd ===
                "number"
                  ? data.feeUsd
                  : undefined,

              physicalBacking:
                data.physicalBacking,

              blockchainTx:
                data.blockchainTx,

              createdAt:
                data.createdAt
                  ?.toDate?.()
                  ?.toISOString?.() ||
                data.createdAt,

              updatedAt:
                data.updatedAt
                  ?.toDate?.()
                  ?.toISOString?.() ||
                data.updatedAt,
            };
          });

        setTransactions(records);
      },
      (error) => {
        console.error(
          "Transaction listener:",
          error
        );

        setTransactions([]);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  /* =========================================================
     MARKET SPOT
  ========================================================= */

  useEffect(() => {
    const spotRef = doc(
      db,
      "market",
      "spot"
    );

    const unsubscribe = onSnapshot(
      spotRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setSpotData(DEFAULT_SPOT);
          return;
        }

        const data = snapshot.data();

        setSpotData({
          pricePerGram:
            Number(
              data.pricePerGram || 110
            ),

          currency:
            data.currency || "USD",

          updatedAt:
            data.updatedAt
              ?.toDate?.()
              ?.toISOString?.() ||
            data.updatedAt ||
            new Date().toISOString(),

          source:
            data.source ||
            "GOLD10 reference price",
        });
      },
      (error) => {
        console.warn(
          "Spot price unavailable:",
          error
        );

        setSpotData(DEFAULT_SPOT);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================================
     USER DIRECTORY
  ========================================================= */

  useEffect(() => {
    if (!firebaseUser) {
      setAllUsers([]);
      return;
    }

    const loadUsers = async () => {
      try {
        const snapshot =
          await getDocs(
            collection(db, "users")
          );

        const users: UserProfile[] =
          snapshot.docs
            .map((item) => {
              const data = item.data();

              return {
                userId:
                  data.userId ||
                  item.id,

                name:
                  data.name ||
                  "GOLD10 User",

                email:
                  data.email ||
                  "",

                walletAddress:
                  data.walletAddress ||
                  "",

                goldBalance:
                  Number(
                    data.goldBalance || 0
                  ),

                usdBalance:
                  Number(
                    data.usdBalance || 0
                  ),

                status:
                  data.status ||
                  "active",

                createdAt:
                  data.createdAt
                    ?.toDate?.()
                    ?.toISOString?.() ||
                  data.createdAt,

                updatedAt:
                  data.updatedAt
                    ?.toDate?.()
                    ?.toISOString?.() ||
                  data.updatedAt,
              };
            })
            .filter(
              (user) =>
                user.status !==
                "suspended"
            );

        setAllUsers(users);
      } catch (error) {
        console.error(
          "Unable to load users:",
          error
        );

        setAllUsers([]);
      }
    };

    loadUsers();
  }, [firebaseUser]);

  /* =========================================================
     CALLBACKS
  ========================================================= */

  const handlePurchaseSuccess = (
    purchase: any
  ) => {
    console.log(
      "Purchase recorded:",
      purchase
    );

    setActiveTab("dashboard");
  };

  const handleTransferSuccess = (
    transfer?: any
  ) => {
    console.log(
      "Transfer recorded:",
      transfer
    );

    setShowTransferModal(false);
  };

  const handleRedeemSuccess = (
    redemption?: any
  ) => {
    console.log(
      "Redemption request recorded:",
      redemption
    );

    setShowRedeemModal(false);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#d4af37] flex items-center justify-center">
        <div className="text-center">
          <div className="font-serif text-3xl text-white tracking-widest">
            GOLD10
          </div>

          <div className="mt-4 text-xs uppercase tracking-[0.25em] text-[#d4af3788]">
            Connecting securely...
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     LOGIN SCREEN
  ========================================================= */

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#d4af37] flex items-center justify-center px-6">

        <div className="max-w-md w-full border border-[#d4af3744] bg-[#0a0a0a] p-8">

          <div className="text-center">

            <h1 className="font-serif text-3xl text-white tracking-widest">
              GOLD10
            </h1>

            <p className="mt-3 text-sm text-[#d4af37aa]">
              24K gold asset platform
            </p>

          </div>

          <form
            onSubmit={handleAuthentication}
            className="mt-8"
          >

            <label className="block text-xs uppercase tracking-widest text-white/60">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-2 w-full bg-black border border-[#d4af3744] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
            />

            <label className="block mt-5 text-xs uppercase tracking-widest text-white/60">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              autoComplete={
                isRegistering
                  ? "new-password"
                  : "current-password"
              }
              className="mt-2 w-full bg-black border border-[#d4af3744] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
            />

            {loginError && (
              <div className="mt-4 border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-6 w-full border border-[#d4af37] px-5 py-3 text-xs uppercase tracking-widest text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition disabled:opacity-50"
            >
              {loginLoading
                ? "Please wait..."
                : isRegistering
                ? "Create Account"
                : "Sign In"}
            </button>

          </form>

          <div className="mt-6 text-center">

            <button
              type="button"
              onClick={() => {
                setIsRegistering(
                  !isRegistering
                );

                setLoginError("");
              }}
              className="text-xs text-white/50 hover:text-[#d4af37] transition"
            >
              {isRegistering
                ? "Already have an account? Sign in"
                : "New to GOLD10? Create an account"}
            </button>

          </div>

          <div className="mt-8 pt-5 border-t border-[#d4af3722] text-center text-[9px] uppercase tracking-[0.2em] text-white/30">
            Firebase Authentication
          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     PROFILE LOADING
  ========================================================= */

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#d4af37] flex items-center justify-center">
        <div className="text-center">

          <div className="font-serif text-3xl text-white tracking-widest">
            GOLD10
          </div>

          <div className="mt-4 text-xs uppercase tracking-[0.25em] text-[#d4af3788]">
            Loading account...
          </div>

        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN APPLICATION
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4af37] flex flex-col">

      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={() => {}}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        spotData={spotData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <PriceTicker
          spotData={spotData}
          onRefresh={() => {
            window.location.reload();
          }}
        />

        {activeTab === "dashboard" && (
          <PortfolioOverview
            currentUser={currentUser}
            userBars={userBars}
            transactions={transactions}
            spotData={spotData}
            onOpenPurchase={() =>
              setActiveTab("purchase")
            }
            onOpenTransfer={() =>
              setShowTransferModal(true)
            }
            onOpenRedeem={() =>
              setShowRedeemModal(true)
            }
            onOpenArchitecture={() =>
              setActiveTab("architecture")
            }
          />
        )}

        {activeTab === "purchase" && (
          <PurchaseTerminal
            currentUser={currentUser}
            spotData={spotData}
            onPurchaseComplete={
              handlePurchaseSuccess
            }
            onViewArchitecture={() =>
              setActiveTab("architecture")
            }
          />
        )}

        {activeTab === "blockchain" && (
          <BlockchainExplorer
            transactions={transactions}
            onViewContractCode={() =>
              setActiveTab("architecture")
            }
          />
        )}

        {activeTab === "architecture" && (
          <ArchitectureView />
        )}

      </main>

      <footer className="mt-auto border-t border-[#d4af3722] bg-[#050505] text-[#d4af37aa] py-4 px-6 sm:px-10 text-[10px] uppercase tracking-[0.2em]">

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <span className="font-serif font-bold text-white tracking-widest">
              GOLD10
            </span>

            <span className="opacity-40">
              •
            </span>

            <span className="opacity-70">
              Firebase-backed account ledger
            </span>

          </div>

          <div className="flex items-center gap-6 opacity-60 text-[9px] font-mono">

            <span>
              Firebase Auth
            </span>

            <span>
              Firestore
            </span>

            <span>
              Real-time Ledger
            </span>

            <button
              onClick={async () => {
                try {
                  await signOut(auth);
                } catch (error) {
                  console.error(
                    "Sign out failed:",
                    error
                  );
                }
              }}
              className="hover:text-[#d4af37] transition"
            >
              Sign Out
            </button>

          </div>

        </div>

      </footer>

      {showTransferModal && (
        <TransferModal
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() =>
            setShowTransferModal(false)
          }
          onTransferSuccess={
            handleTransferSuccess
          }
        />
      )}

      {showRedeemModal && (
        <PhysicalRedemptionModal
          currentUser={currentUser}
          userBars={userBars}
          onClose={() =>
            setShowRedeemModal(false)
          }
          onRedeemSuccess={
            handleRedeemSuccess
          }
        />
      )}

    </div>
  );
}
```
