import React, { useEffect, useState } from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
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
  /* ---------------------------------------------------------
     AUTH STATE
  --------------------------------------------------------- */

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  /* ---------------------------------------------------------
     LOGIN STATE
  --------------------------------------------------------- */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [showCreateAccount, setShowCreateAccount] = useState(false);

  /* ---------------------------------------------------------
     APPLICATION STATE
  --------------------------------------------------------- */

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

  /* ---------------------------------------------------------
     FIREBASE AUTHENTICATION LISTENER
  --------------------------------------------------------- */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log(
          "Firebase authentication state:",
          user ? user.email : "signed out"
        );

        setFirebaseUser(user);
        setAuthLoading(false);

        if (!user) {
          setCurrentUser(DEFAULT_USER);
          setProfileLoading(false);
        }
      },
      (error) => {
        console.error(
          "Firebase authentication error:",
          error
        );

        setFirebaseUser(null);
        setAuthLoading(false);
        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* ---------------------------------------------------------
     LOGIN / CREATE ACCOUNT
  --------------------------------------------------------- */

  const handleAuthentication = async () => {
    setAuthError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setAuthError(
        "Please enter your email and password."
      );
      return;
    }

    if (password.length < 6) {
      setAuthError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setIsSigningIn(true);

    try {
      if (showCreateAccount) {
        console.log(
          "Creating GOLD10 account..."
        );

        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

        console.log(
          "GOLD10 account created successfully."
        );
      } else {
        console.log(
          "Signing into GOLD10..."
        );

        await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

        console.log(
          "GOLD10 sign-in successful."
        );
      }
    } catch (error: any) {
      console.error(
        "Authentication failed:",
        error
      );

      const errorCode = error?.code || "";

      switch (errorCode) {
        case "auth/invalid-credential":
          setAuthError(
            "Invalid email or password."
          );
          break;

        case "auth/invalid-login-credentials":
          setAuthError(
            "Invalid email or password."
          );
          break;

        case "auth/wrong-password":
          setAuthError(
            "Invalid email or password."
          );
          break;

        case "auth/user-not-found":
          setAuthError(
            "No account exists with this email."
          );
          break;

        case "auth/email-already-in-use":
          setAuthError(
            "This email already has a GOLD10 account. Please sign in."
          );
          break;

        case "auth/invalid-email":
          setAuthError(
            "Please enter a valid email address."
          );
          break;

        case "auth/weak-password":
          setAuthError(
            "Password must be at least 6 characters."
          );
          break;

        case "auth/too-many-requests":
          setAuthError(
            "Too many attempts. Please wait and try again."
          );
          break;

        case "auth/network-request-failed":
          setAuthError(
            "Network error. Please check your internet connection."
          );
          break;

        case "auth/operation-not-allowed":
          setAuthError(
            "Email/password authentication is not enabled in Firebase."
          );
          break;

        default:
          setAuthError(
            error?.message ||
            "Authentication failed. Please try again."
          );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  /* ---------------------------------------------------------
     SIGN OUT
  --------------------------------------------------------- */

  const handleSignOut = async () => {
    try {
      await signOut(auth);

      setEmail("");
      setPassword("");
      setAuthError("");
      setShowCreateAccount(false);
    } catch (error) {
      console.error(
        "Sign out failed:",
        error
      );
    }
  };

  /* ---------------------------------------------------------
     USER PROFILE
  --------------------------------------------------------- */

  useEffect(() => {
    if (!firebaseUser) {
      return;
    }

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

            await setDoc(
              userRef,
              {
                ...profile,

                createdAt:
                  serverTimestamp(),

                updatedAt:
                  serverTimestamp(),
              }
            );

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
                data.walletAddress ||
                "",

              goldBalance:
                typeof data.goldBalance ===
                "number"
                  ? data.goldBalance
                  : 0,

              usdBalance:
                typeof data.usdBalance ===
                "number"
                  ? data.usdBalance
                  : 0,

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

  /* ---------------------------------------------------------
     USER VAULT BARS
  --------------------------------------------------------- */

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
          snapshot.docs.map(
            (item) => {
              const data =
                item.data();

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
                    data.weightGrams ||
                    0
                  ),

                purity:
                  data.purity ||
                  "999.9",

                status:
                  data.status ||
                  "available",

                allocatedGold10:
                  Number(
                    data.allocatedGold10 ||
                    0
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
            }
          );

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

  /* ---------------------------------------------------------
     USER TRANSACTIONS
  --------------------------------------------------------- */

  useEffect(() => {
    if (!firebaseUser) {
      setTransactions([]);
      return;
    }

    const transactionsRef =
      collection(
        db,
        "users",
        firebaseUser.uid,
        "transactions"
      );

    const transactionQuery =
      query(
        transactionsRef,
        orderBy(
          "timestamp",
          "desc"
        )
      );

    const unsubscribe =
      onSnapshot(
        transactionQuery,
        (snapshot) => {
          const records:
            TransactionRecord[] =
            snapshot.docs.map(
              (item) => {
                const data =
                  item.data();

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
                      data.tokenAmount ||
                      0
                    ),

                  goldGrams:
                    Number(
                      data.goldGrams ||
                      0
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
              }
            );

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

  /* ---------------------------------------------------------
     MARKET SPOT PRICE
  --------------------------------------------------------- */

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
          setSpotData(
            DEFAULT_SPOT
          );
          return;
        }

        const data =
          snapshot.data();

        setSpotData({
          pricePerGram:
            Number(
              data.pricePerGram ||
              110
            ),

          currency:
            data.currency ||
            "USD",

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

        setSpotData(
          DEFAULT_SPOT
        );
      }
    );

    return () => unsubscribe();
  }, []);

  /* ---------------------------------------------------------
     USER DIRECTORY
  --------------------------------------------------------- */

  useEffect(() => {
    if (!firebaseUser) {
      setAllUsers([]);
      return;
    }

    const loadUsers = async () => {
      try {
        const snapshot =
          await getDocs(
            collection(
              db,
              "users"
            )
          );

        const users:
          UserProfile[] =
          snapshot.docs
            .map(
              (item) => {
                const data =
                  item.data();

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
                      data.goldBalance ||
                      0
                    ),

                  usdBalance:
                    Number(
                      data.usdBalance ||
                      0
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
              }
            )
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

  /* ---------------------------------------------------------
     CALLBACKS
  --------------------------------------------------------- */

  const handlePurchaseSuccess = (
    purchase: any
  ) => {
    console.log(
      "Purchase recorded:",
      purchase
    );

    setActiveTab(
      "dashboard"
    );
  };

  const handleTransferSuccess = (
    transfer?: any
  ) => {
    console.log(
      "Transfer recorded:",
      transfer
    );

    setShowTransferModal(
      false
    );
  };

  const handleRedeemSuccess = (
    redemption?: any
  ) => {
    console.log(
      "Redemption request recorded:",
      redemption
    );

    setShowRedeemModal(
      false
    );
  };

  /* ---------------------------------------------------------
     LOADING SCREEN
  --------------------------------------------------------- */

  if (
    authLoading ||
    profileLoading
  ) {
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

  /* ---------------------------------------------------------
     LOGIN SCREEN
  --------------------------------------------------------- */

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

            <p className="mt-5 text-xs text-white/50">
              {showCreateAccount
                ? "Create your GOLD10 account."
                : "Please sign in to access your GOLD10 account."}
            </p>

          </div>

          <div className="mt-8 space-y-4">

            {/* EMAIL */}

            <div>

              <label className="block mb-2 text-[10px] uppercase tracking-widest text-[#d4af3788]">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );
                  setAuthError("");
                }}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    handleAuthentication();
                  }
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full border border-[#d4af3744] bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block mb-2 text-[10px] uppercase tracking-widest text-[#d4af3788]">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );
                  setAuthError("");
                }}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    handleAuthentication();
                  }
                }}
                placeholder="Minimum 6 characters"
                autoComplete={
                  showCreateAccount
                    ? "new-password"
                    : "current-password"
                }
                className="w-full border border-[#d4af3744] bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
              />

            </div>

            {/* ERROR */}

            {authError && (
              <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                {authError}
              </div>
            )}

            {/* AUTH BUTTON */}

            <button
              type="button"
              disabled={isSigningIn}
              onClick={
                handleAuthentication
              }
              className="w-full border border-[#d4af37] bg-[#d4af37] px-5 py-3 text-xs uppercase tracking-widest text-black transition hover:bg-transparent hover:text-[#d4af37] disabled:opacity-50"
            >

              {isSigningIn
                ? "Authenticating..."
                : showCreateAccount
                ? "Create Account"
                : "Sign In"}

            </button>

            {/* SWITCH LOGIN / CREATE */}

            <button
              type="button"
              disabled={isSigningIn}
              onClick={() => {
                setShowCreateAccount(
                  !showCreateAccount
                );

                setAuthError("");
              }}
              className="w-full px-5 py-3 text-xs uppercase tracking-widest text-[#d4af37aa] hover:text-[#d4af37]"
            >

              {showCreateAccount
                ? "Already have an account? Sign In"
                : "Create a new account"}

            </button>

          </div>

          <div className="mt-8 border-t border-[#d4af3722] pt-5 text-center">

            <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
              Firebase Authentication
            </div>

          </div>

        </div>

      </div>
    );
  }

  /* ---------------------------------------------------------
     MAIN GOLD10 APPLICATION
  --------------------------------------------------------- */

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

        {/* DASHBOARD */}

        {activeTab ===
          "dashboard" && (
          <PortfolioOverview
            currentUser={
              currentUser
            }
            userBars={
              userBars
            }
            transactions={
              transactions
            }
            spotData={
              spotData
            }
            onOpenPurchase={() =>
              setActiveTab(
                "purchase"
              )
            }
            onOpenTransfer={() =>
              setShowTransferModal(
                true
              )
            }
            onOpenRedeem={() =>
              setShowRedeemModal(
                true
              )
            }
            onOpenArchitecture={() =>
              setActiveTab(
                "architecture"
              )
            }
          />
        )}

        {/* PURCHASE */}

        {activeTab ===
          "purchase" && (
          <PurchaseTerminal
            currentUser={
              currentUser
            }
            spotData={
              spotData
            }
            onPurchaseComplete={
              handlePurchaseSuccess
            }
            onViewArchitecture={() =>
              setActiveTab(
                "architecture"
              )
            }
          />
        )}

        {/* BLOCKCHAIN */}

        {activeTab ===
          "blockchain" && (
          <BlockchainExplorer
            transactions={
              transactions
            }
            onViewContractCode={() =>
              setActiveTab(
                "architecture"
              )
            }
          />
        )}

        {/* ARCHITECTURE */}

        {activeTab ===
          "architecture" && (
          <ArchitectureView />
        )}

      </main>

      {/* FOOTER */}

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

            {/* SIGN OUT */}

            <button
              onClick={
                handleSignOut
              }
              className="text-[#d4af37] hover:text-white transition"
            >
              Sign Out
            </button>

          </div>

        </div>

      </footer>

      {/* TRANSFER MODAL */}

      {showTransferModal && (
        <TransferModal
          currentUser={
            currentUser
          }
          allUsers={
            allUsers
          }
          onClose={() =>
            setShowTransferModal(
              false
            )
          }
          onTransferSuccess={
            handleTransferSuccess
          }
        />
      )}

      {/* REDEMPTION MODAL */}

      {showRedeemModal && (
        <PhysicalRedemptionModal
          currentUser={
            currentUser
          }
          userBars={
            userBars
          }
          onClose={() =>
            setShowRedeemModal(
              false
            )
          }
          onRedeemSuccess={
            handleRedeemSuccess
          }
        />
      )}

    </div>
  );
}
