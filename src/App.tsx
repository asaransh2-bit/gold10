import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
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

import { UserProfile, VaultBar, TransactionRecord, GoldSpotData } from "./types";

const DEFAULT_SPOT: GoldSpotData = {
  price: 110,
  currency: "USD",
  unit: "gram",
  timestamp: Date.now(),
};

const DEFAULT_USER: UserProfile = {
  uid: "",
  name: "GOLD10 User",
  email: "",
  balance: 0,
  totalGoldGrams: 0,
};

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const [currentUser, setCurrentUser] =
    useState<UserProfile>(DEFAULT_USER);

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  const [userBars, setUserBars] = useState<VaultBar[]>([]);

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

  /*
   * Firebase authentication
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);

  /*
   * Create/load the user's Firestore profile
   */
  useEffect(() => {
    if (!firebaseUser) return;

    const loadProfile = async () => {
      const ref = doc(db, "users", firebaseUser.uid);
      const snapshot = await getDoc(ref);

      if (!snapshot.exists()) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          name:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "GOLD10 User",
          email: firebaseUser.email || "",
          balance: 0,
          totalGoldGrams: 0,
        };

        await setDoc(ref, profile);
        setCurrentUser(profile);
      } else {
        setCurrentUser(snapshot.data() as UserProfile);
      }
    };

    loadProfile().catch(console.error);
  }, [firebaseUser]);

  /*
   * Real-time user profile updates
   */
  useEffect(() => {
    if (!firebaseUser) return;

    const ref = doc(db, "users", firebaseUser.uid);

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentUser(snapshot.data() as UserProfile);
      }
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  /*
   * Real-time vault bars
   */
  useEffect(() => {
    if (!firebaseUser) return;

    const ref = collection(
      db,
      "users",
      firebaseUser.uid,
      "vaultBars"
    );

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const bars = snapshot.docs.map(
        (item) => item.data() as VaultBar
      );

      setUserBars(bars);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  /*
   * Real-time transaction ledger
   */
  useEffect(() => {
    if (!firebaseUser) return;

    const ref = collection(
      db,
      "users",
      firebaseUser.uid,
      "transactions"
    );

    const transactionQuery = query(
      ref,
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      transactionQuery,
      (snapshot) => {
        const records = snapshot.docs.map(
          (item) => item.data() as TransactionRecord
        );

        setTransactions(records);
      },
      (error) => {
        console.error("Transaction listener:", error);
        setTransactions([]);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  /*
   * Real-time spot price.
   *
   * The document can later be updated by an authorised
   * server/backend price feed.
   */
  useEffect(() => {
    const ref = doc(db, "market", "spot");

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setSpotData(snapshot.data() as GoldSpotData);
        }
      },
      (error) => {
        console.warn("Spot price unavailable:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  /*
   * Load all users for the transfer interface.
   */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "users")
        );

        const users = snapshot.docs.map(
          (item) => item.data() as UserProfile
        );

        setAllUsers(users);
      } catch (error) {
        console.error("Unable to load users:", error);
      }
    };

    loadUsers();
  }, [firebaseUser]);

  /*
   * These callbacks remain compatible with the
   * existing components.
   *
   * Firebase listeners automatically refresh the UI.
   */
  const handlePurchaseSuccess = () => {
    console.log("Purchase completed.");
  };

  const handleTransferSuccess = () => {
    console.log("Transfer completed.");
  };

  const handleRedeemSuccess = () => {
    console.log("Redemption request created.");
  };

  /*
   * Authentication guard
   */
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#d4af37] flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-[#d4af3744] bg-[#0a0a0a] p-8 text-center">
          <h1 className="font-serif text-3xl text-white tracking-widest">
            GOLD10
          </h1>

          <p className="mt-4 text-sm text-[#d4af37aa]">
            Secure 24K gold-backed digital asset platform
          </p>

          <p className="mt-6 text-xs text-white/50">
            Please sign in to access your GOLD10 account.
          </p>

          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="mt-6 w-full border border-[#d4af37] px-5 py-3 text-xs uppercase tracking-widest text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4af37] flex flex-col font-sans border border-[#d4af3722]">

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
          onRefresh={() => window.location.reload()}
        />

        {activeTab === "dashboard" && (
          <PortfolioOverview
            currentUser={currentUser}
            userBars={userBars}
            transactions={transactions}
            spotData={spotData}
            onOpenPurchase={() => setActiveTab("purchase")}
            onOpenTransfer={() => setShowTransferModal(true)}
            onOpenRedeem={() => setShowRedeemModal(true)}
            onOpenArchitecture={() => setActiveTab("architecture")}
          />
        )}

        {activeTab === "purchase" && (
          <PurchaseTerminal
            currentUser={currentUser}
            spotData={spotData}
            onPurchaseComplete={handlePurchaseSuccess}
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
              10g 24K Physical Allocated Standard
            </span>
          </div>

          <div className="flex items-center gap-6 opacity-60 text-[9px] font-mono">
            <span>
              Firebase Auth
            </span>

            <span>
              Firestore Ledger
            </span>

            <span>
              Real-time Database
            </span>
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
          onTransferSuccess={handleTransferSuccess}
        />
      )}

      {showRedeemModal && (
        <PhysicalRedemptionModal
          currentUser={currentUser}
          userBars={userBars}
          onClose={() =>
            setShowRedeemModal(false)
          }
          onRedeemSuccess={handleRedeemSuccess}
        />
      )}

    </div>
  );
}
