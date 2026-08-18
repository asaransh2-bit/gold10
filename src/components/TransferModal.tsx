import React, { useState } from "react";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { UserProfile } from "../types";

interface TransferModalProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onClose: () => void;
  onTransferSuccess: (data: any) => void;
}

export function TransferModal({
  currentUser,
  allUsers,
  onClose,
  onTransferSuccess,
}: TransferModalProps) {
  const [amount, setAmount] = useState(1);
  const [to, setTo] = useState(
    allUsers.find(
      (u) => u.userId !== currentUser.userId
    )?.userId || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const recipient = allUsers.find(
    (u) => u.userId === to
  );

  const handleTransfer = async () => {
    setError("");
    setSuccess(null);

    if (!currentUser.userId) {
      setError("You must be signed in.");
      return;
    }

    if (!to) {
      setError("Please select a recipient.");
      return;
    }

    if (to === currentUser.userId) {
      setError("You cannot transfer GOLD10 to yourself.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Enter a valid GOLD10 amount.");
      return;
    }

    if (amount > currentUser.goldBalance) {
      setError(
        `Insufficient GOLD10 balance. Available: ${currentUser.goldBalance}`
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Create a real persistent transfer request.
       *
       * IMPORTANT:
       * The frontend does NOT modify either user's balance.
       *
       * A trusted backend/Cloud Function must verify this
       * request and perform the actual balance transfer.
       */

      const transferRef = doc(
        collection(db, "transfers")
      );

      const transfer = {
        id: transferRef.id,

        fromUserId: currentUser.userId,

        fromName: currentUser.name,

        toUserId: recipient?.userId || to,

        toName: recipient?.name || "",

        amount: amount,

        asset: "GOLD10",

        status: "PENDING",

        createdAt: serverTimestamp(),
      };

      await setDoc(transferRef, transfer);

      const result = {
        success: true,

        transferId: transferRef.id,

        amount,

        fromUserId: currentUser.userId,

        toUserId: to,

        status: "PENDING",
      };

      setSuccess(result);

      onTransferSuccess(result);

    } catch (err) {
      console.error(
        "Transfer request error:",
        err
      );

      setError(
        "Unable to create the transfer request. Please check your Firebase configuration and Firestore rules."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-4">

      <div className="bg-[#0a0a0a] border border-[#d4af37] p-6 rounded w-full max-w-md">

        <div className="flex justify-between items-center">

          <h2 className="font-serif text-white text-xl">
            Transfer GOLD10
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white"
          >
            ✕
          </button>

        </div>

        <p className="text-xs text-zinc-500 mt-2">
          Transfer request will be recorded in Firestore.
        </p>

        {success && (
          <div className="mt-5 p-4 border border-emerald-500/30 bg-emerald-500/5">

            <div className="text-emerald-400 font-semibold">
              Transfer request created
            </div>

            <div className="text-xs text-zinc-400 mt-2">
              Transfer ID
            </div>

            <div className="text-xs text-[#d4af37] break-all mt-1">
              {success.transferId}
            </div>

            <div className="text-xs text-zinc-400 mt-3">
              {success.amount} GOLD10
            </div>

            <div className="text-xs text-yellow-500 mt-2">
              Status: PENDING
            </div>

            <p className="text-xs text-zinc-500 mt-3">
              The balance will change only after the
              trusted transfer processor verifies the request.
            </p>

          </div>
        )}

        {error && (
          <div className="mt-5 p-3 border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!success && (
          <>
            <label className="block text-[10px] uppercase tracking-widest text-[#d4af37aa] mt-6">
              Recipient
            </label>

            <select
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
              className="w-full mt-2 bg-black border border-[#d4af3733] p-3 text-white"
            >

              <option value="">
                Select recipient
              </option>

              {allUsers
                .filter(
                  (u) =>
                    u.userId !==
                    currentUser.userId
                )
                .map((u) => (
                  <option
                    key={u.userId}
                    value={u.userId}
                  >
                    {u.name} — {u.email}
                  </option>
                ))}

            </select>

            <label className="block text-[10px] uppercase tracking-widest text-[#d4af37aa] mt-5">
              GOLD10 Amount
            </label>

            <input
              type="number"
              min="0.1"
              step="0.1"
              max={currentUser.goldBalance}
              value={amount}
              onChange={(e) =>
                setAmount(
                  Number(e.target.value)
                )
              }
              className="w-full mt-2 bg-black border border-[#d4af3733] p-3 text-white"
            />

            <div className="mt-3 text-xs text-zinc-500">
              Available balance:
              <span className="text-[#d4af37] ml-2">
                {currentUser.goldBalance} GOLD10
              </span>
            </div>

            <div className="flex gap-2 mt-6">

              <button
                disabled={loading}
                onClick={handleTransfer}
                className="flex-1 bg-[#d4af37] text-black p-3 font-bold disabled:opacity-50"
              >
                {loading
                  ? "Creating..."
                  : "Create Transfer"}
              </button>

              <button
                onClick={onClose}
                className="px-4 border border-zinc-700 text-white"
              >
                Cancel
              </button>

            </div>
          </>
        )}

        {success && (
          <button
            onClick={onClose}
            className="w-full mt-5 border border-zinc-700 text-white p-3"
          >
            Close
          </button>
        )}

      </div>

    </div>
  );
}
