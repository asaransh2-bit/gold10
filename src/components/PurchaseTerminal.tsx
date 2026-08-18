import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Coins,
  Loader2,
} from "lucide-react";

import {
  collection,
  doc,
  increment,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  UserProfile,
  GoldSpotData,
  TransactionRecord,
} from "../types";

interface PurchaseTerminalProps {
  currentUser: UserProfile;
  spotData: GoldSpotData;
  onPurchaseComplete: (data: any) => void;
  onViewArchitecture: () => void;
}

export function PurchaseTerminal({
  currentUser,
  spotData,
  onPurchaseComplete,
  onViewArchitecture,
}: PurchaseTerminalProps) {
  const [amount, setAmount] = useState(2);
  const [wallet, setWallet] = useState(
    currentUser.walletAddress || ""
  );

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const grams = amount * 10;

  const cost =
    grams * spotData.pricePerGram;

  const fee =
    cost * 0.005;

  const total =
    cost + fee;

  const createPurchase = async () => {
    setError("");
    setResult(null);

    if (!currentUser.uid) {
      setError("You must be signed in.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Enter a valid GOLD10 quantity.");
      return;
    }

    if (amount > 500) {
      setError("Maximum order size is 500 GOLD10.");
      return;
    }

    setLoading(true);

    try {
      /*
       * Every purchase gets its own Firestore document.
       */
      const orderRef = doc(
        collection(
          db,
          "users",
          currentUser.uid,
          "orders"
        )
      );

      /*
       * Transaction ledger document.
       */
      const transactionRef = doc(
        collection(
          db,
          "users",
          currentUser.uid,
          "transactions"
        )
      );

      /*
       * Update the user's balance and create
       * the permanent order + transaction records
       * atomically.
       */
      const batch = writeBatch(db);

      batch.set(orderRef, {
        id: orderRef.id,

        userId: currentUser.uid,

        type: "GOLD10_PURCHASE",

        quantity: amount,

        goldGrams: grams,

        spotPricePerGram:
          spotData.pricePerGram,

        metalValue: cost,

        fee: fee,

        totalValue: total,

        walletAddress: wallet,

        status: "PENDING_PAYMENT",

        createdAt:
          serverTimestamp(),
      });

      const transaction: Omit<
        TransactionRecord,
        "timestamp"
      > & {
        timestamp: any;
      } = {
        id: transactionRef.id,

        type: "PURCHASE",

        amount: amount,

        goldGrams: grams,

        status: "PENDING_PAYMENT",

        reference: orderRef.id,

        timestamp:
          serverTimestamp(),
      };

      batch.set(
        transactionRef,
        transaction
      );

      /*
       * IMPORTANT:
       *
       * We do NOT increase the user's GOLD10
       * balance yet.
       *
       * The order is currently PENDING_PAYMENT.
       *
       * The balance should only be credited after
       * a genuine payment provider confirms payment.
       */
      await batch.commit();

      const purchaseResult = {
        success: true,

        orderId: orderRef.id,

        amount,

        grams,

        cost,

        fee,

        total,

        status: "PENDING_PAYMENT",
      };

      setResult(purchaseResult);

      onPurchaseComplete(
        purchaseResult
      );

    } catch (err) {
      console.error(
        "Purchase order error:",
        err
      );

      setError(
        "Unable to create the order. Check your Firebase configuration and Firestore rules."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#d4af3722] rounded p-6 sm:p-10 space-y-7">

      {result && (
        <div className="p-5 border border-emerald-500/30 bg-emerald-500/5">

          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={20} />

            <span>
              Order created successfully
            </span>
          </div>

          <div className="text-white mt-3">
            Order ID:
          </div>

          <div className="text-xs text-[#d4af37] mt-1 break-all">
            {result.orderId}
          </div>

          <div className="text-xs text-zinc-400 mt-4">
            {result.amount} GOLD10 ·{" "}
            {result.grams.toFixed(1)}g 24K
          </div>

          <div className="text-xs text-yellow-500 mt-3">
            Status: PAYMENT REQUIRED
          </div>

        </div>
      )}

      {error && (
        <div className="p-4 border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between">

        <div>

          <h2 className="font-serif text-2xl text-white">
            Buy GOLD10
          </h2>

          <p className="text-xs text-zinc-500 mt-1">
            Create a real persistent GOLD10 order.
          </p>

        </div>

        <button
          onClick={onViewArchitecture}
          className="text-xs text-[#d4af37]"
        >
          Security Model
        </button>

      </div>

      <div>

        <label className="text-[10px] uppercase tracking-widest text-[#d4af37aa]">
          Quantity
        </label>

        <input
          type="number"
          min="0.1"
          max="500"
          step="0.1"
          value={amount}
          onChange={(e) =>
            setAmount(
              Number(e.target.value)
            )
          }
          className="w-full mt-2 bg-black border border-[#d4af3733] p-4 text-2xl text-white"
        />

        <div className="grid grid-cols-5 gap-2 mt-2">

          {[1, 2, 5, 10, 50].map(
            (x) => (
              <button
                key={x}
                onClick={() =>
                  setAmount(x)
                }
                className="text-xs p-2 border border-[#d4af3733] hover:bg-[#d4af3711]"
              >
                {x} GOLD10
              </button>
            )
          )}

        </div>

      </div>

      <div>

        <label className="text-[10px] uppercase tracking-widest text-[#d4af37aa]">
          Destination Wallet
        </label>

        <input
          value={wallet}
          onChange={(e) =>
            setWallet(e.target.value)
          }
          placeholder="Wallet address (optional for now)"
          className="w-full mt-2 bg-black border border-[#d4af3733] p-3 text-xs text-white"
        />

      </div>

      <div className="p-5 bg-black border border-[#d4af3722] text-xs space-y-3">

        <div className="flex justify-between text-zinc-400">
          <span>Backing</span>

          <span>
            {grams.toFixed(1)}g 24K
          </span>
        </div>

        <div className="flex justify-between text-zinc-400">
          <span>Spot</span>

          <span>
            $
            {spotData.pricePerGram.toFixed(
              2
            )}
            /g
          </span>
        </div>

        <div className="flex justify-between text-zinc-400">
          <span>Platform fee (0.5%)</span>

          <span>
            ${fee.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between border-t border-[#d4af3722] pt-3 text-white text-lg">

          <b>Total</b>

          <b>
            ${total.toFixed(2)}
          </b>

        </div>

      </div>

      <div className="p-4 border border-[#d4af3722] bg-[#d4af3708] text-xs text-zinc-500">

        <div className="flex gap-2">

          <Coins
            size={16}
            className="text-[#d4af37] shrink-0"
          />

          <span>
            This creates a persistent Firestore
            order. GOLD10 is credited only after
            a verified payment is received.
          </span>

        </div>

      </div>

      <button
        disabled={loading}
        onClick={createPurchase}
        className="w-full bg-[#d4af37] text-black p-4 font-bold uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50"
      >

        {loading ? (
          <>
            <Loader2
              size={20}
              className="animate-spin"
            />

            Creating Order...
          </>
        ) : (
          <>
            <ShieldCheck
              size={20}
            />

            Create GOLD10 Order
          </>
        )}

      </button>

    </div>
  );
}
