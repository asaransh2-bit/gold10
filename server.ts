import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USERS,
  INITIAL_VAULT_BARS,
  INITIAL_TRANSACTIONS,
  INITIAL_SPOT_DATA
} from './src/data/mockDatabase';
import { UserProfile, VaultBar, TransactionRecord, GoldSpotData } from './src/types';

// In-Memory Database State for Full-Stack Simulation
const usersState: Record<string, UserProfile> = { ...INITIAL_USERS };
const vaultBarsState: Record<string, VaultBar[]> = { ...INITIAL_VAULT_BARS };
let transactionsState: TransactionRecord[] = [...INITIAL_TRANSACTIONS];

// Spot price with realistic micro-ticks
let currentSpot: GoldSpotData = { ...INITIAL_SPOT_DATA };

setInterval(() => {
  const delta = (Math.random() - 0.48) * 0.15;
  const newGram = Math.max(75, +(currentSpot.pricePerGram + delta).toFixed(2));
  const newOz = +(newGram * 31.1034768).toFixed(2);
  currentSpot = {
    ...currentSpot,
    pricePerGram: newGram,
    pricePerOunce: newOz,
    pricePerToken10g: +(newGram * 10).toFixed(2),
    lastUpdated: new Date().toISOString()
  };
}, 4000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'GOLD10 Vault Backend & Cloud Functions Engine' });
  });

  // Get Live Spot Gold Price
  app.get('/api/spot-price', (req, res) => {
    res.json(currentSpot);
  });

  // List Available Demo Accounts
  app.get('/api/users', (req, res) => {
    res.json(Object.values(usersState));
  });

  // Read User Profile & Gold Balance (simulates Firestore users/{userId} document)
  app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params;
    const user = usersState[userId];
    if (!user) {
      // Auto-create for demo
      const newUser: UserProfile = {
        userId,
        email: `${userId}@gold10.io`,
        createdAt: new Date().toISOString(),
        goldBalance: 0,
        kycStatus: 'verified'
      };
      usersState[userId] = newUser;
      vaultBarsState[userId] = [];
      return res.json(newUser);
    }
    res.json(user);
  });

  // Read User Allocated Physical Vault Bars (users/{userId}/vaultBars)
  app.get('/api/user/:userId/vault-bars', (req, res) => {
    const { userId } = req.params;
    const bars = vaultBarsState[userId] || [];
    res.json(bars);
  });

  // Read User Transactions Ledger (transactions/{txId})
  app.get('/api/user/:userId/transactions', (req, res) => {
    const { userId } = req.params;
    const txs = transactionsState.filter((t) => t.userId === userId);
    res.json(txs);
  });

  /**
   * Mock Cloud Function: POST /api/purchase
   * Replicates: functions.https.onCall(purchaseGoldToken)
   * Enforces backend atomic increment & cryptographic EVM mint preparation
   */
  app.post('/api/purchase', (req, res) => {
    const { userId, tokenAmount, paymentMethod, recipientWallet } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing authenticated userId' });
    }

    const numAmount = Number(tokenAmount);
    if (!numAmount || numAmount <= 0 || isNaN(numAmount)) {
      return res.status(400).json({ error: 'Invalid tokenAmount. Must be positive number.' });
    }

    if (numAmount > 500) {
      return res.status(400).json({ error: 'Exceeded maximum order limit of 500 GOLD10.' });
    }

    // 1. Get or initialize user in Firestore ledger
    if (!usersState[userId]) {
      usersState[userId] = {
        userId,
        email: `${userId}@gold10.io`,
        createdAt: new Date().toISOString(),
        goldBalance: 0,
        walletAddress: recipientWallet || '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
        kycStatus: 'verified'
      };
      vaultBarsState[userId] = [];
    }

    const user = usersState[userId];

    // 2. Atomic Balance Increment
    const prevBalance = user.goldBalance;
    const newBalance = +(prevBalance + numAmount).toFixed(4);
    user.goldBalance = newBalance;

    // 3. Allocate Physical 10g 24K Vault Bars
    const vaultLocations = [
      { loc: 'Zurich Freeport Vault Zone B-12, Switzerland', ref: 'Argor-Heraeus (Mendrisio, CH)', prefix: 'CH' },
      { loc: 'Le Freeport High-Security Vault A, Singapore', ref: 'Valcambi Suisse (Balerna, CH)', prefix: 'SG' },
      { loc: "Brink's Global Services Vault 3, London, UK", ref: 'PAMP SA (Castel San Pietro, CH)', prefix: 'UK' }
    ];

    const allocatedBars: VaultBar[] = [];
    const fullBarsCount = Math.floor(numAmount);
    const hasFractional = numAmount - fullBarsCount > 0;

    for (let i = 0; i < (fullBarsCount || 1); i++) {
      const vChoice = vaultLocations[Math.floor(Math.random() * vaultLocations.length)];
      const serial = `G10-${vChoice.prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
      const bar: VaultBar = {
        serialNumber: serial,
        refinery: vChoice.ref,
        purity: '999.9 Fine 24K Gold (LBMA Good Delivery)',
        weightGrams: hasFractional && fullBarsCount === 0 ? +(numAmount * 10).toFixed(2) : 10.0,
        vaultLocation: vChoice.loc,
        allocatedAt: new Date().toISOString(),
        auditCertificateId: `LBMA-${vChoice.prefix}-${serial.split('-')[2]}-VERIFIED`,
        merkleRootHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      };
      allocatedBars.push(bar);
    }

    if (!vaultBarsState[userId]) {
      vaultBarsState[userId] = [];
    }
    vaultBarsState[userId].unshift(...allocatedBars);

    // 4. Generate EVM Mint Payload & Proof Hash
    const txId = `tx_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const vaultReceiptHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const mockSignature = `0x${Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}1b`;
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const totalUsd = +(numAmount * currentSpot.pricePerToken10g).toFixed(2);

    const transactionRecord: TransactionRecord = {
      id: txId,
      userId,
      type: 'MINT_PURCHASE',
      tokenAmount: numAmount,
      goldGrams: +(numAmount * 10).toFixed(2),
      usdTotal: totalUsd,
      spotPricePerGram: currentSpot.pricePerGram,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED_ONCHAIN',
      paymentMethod: paymentMethod || 'USDC_INSTANT',
      vaultBarSerials: allocatedBars.map((b) => b.serialNumber),
      blockchainTx: {
        txHash,
        blockNumber: 19845200 + Math.floor(Math.random() * 100),
        network: 'Base Mainnet (EVM)',
        contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        vaultReceiptHash,
        signature: mockSignature
      }
    };

    transactionsState.unshift(transactionRecord);

    return res.json({
      success: true,
      message: `Successfully purchased and minted ${numAmount} GOLD10 (${numAmount * 10}g 24K gold)`,
      user,
      transaction: transactionRecord,
      allocatedBars,
      blockchainRelay: {
        status: 'EMITTED_TO_EVM',
        contract: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        vaultReceiptHash,
        evmSignature: mockSignature,
        gasUsed: '48,190 Gwei'
      }
    });
  });

  // Transfer GOLD10 to another user or external wallet
  app.post('/api/transfer', (req, res) => {
    const { fromUserId, recipientIdOrEmail, tokenAmount } = req.body;
    const amount = Number(tokenAmount);

    if (!fromUserId || !recipientIdOrEmail || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer parameters.' });
    }

    const sender = usersState[fromUserId];
    if (!sender || sender.goldBalance < amount) {
      return res.status(400).json({ error: 'Insufficient GOLD10 balance.' });
    }

    // Deduct from sender
    sender.goldBalance = +(sender.goldBalance - amount).toFixed(4);

    // Find recipient by id or email
    let recipient = Object.values(usersState).find(
      (u) => u.userId === recipientIdOrEmail || u.email.toLowerCase() === recipientIdOrEmail.toLowerCase()
    );

    if (!recipient) {
      // Create recipient
      const recId = `usr_${Math.floor(100000 + Math.random() * 900000)}`;
      recipient = {
        userId: recId,
        email: recipientIdOrEmail.includes('@') ? recipientIdOrEmail : `${recipientIdOrEmail}@gold10.io`,
        createdAt: new Date().toISOString(),
        goldBalance: 0,
        kycStatus: 'verified'
      };
      usersState[recId] = recipient;
      vaultBarsState[recId] = [];
    }

    // Add to recipient
    recipient.goldBalance = +(recipient.goldBalance + amount).toFixed(4);

    // Transfer physical bar allocation if applicable
    const senderBars = vaultBarsState[fromUserId] || [];
    const barsToTransfer = senderBars.splice(0, Math.floor(amount));
    if (!vaultBarsState[recipient.userId]) {
      vaultBarsState[recipient.userId] = [];
    }
    vaultBarsState[recipient.userId].push(...barsToTransfer);

    // Record transactions
    const txId = `tx_xfer_${Date.now()}`;
    const txOut: TransactionRecord = {
      id: `${txId}_out`,
      userId: fromUserId,
      type: 'TRANSFER_OUT',
      tokenAmount: amount,
      goldGrams: +(amount * 10).toFixed(2),
      usdTotal: +(amount * currentSpot.pricePerToken10g).toFixed(2),
      spotPricePerGram: currentSpot.pricePerGram,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED_ONCHAIN',
      paymentMethod: 'USDC_INSTANT',
      vaultBarSerials: barsToTransfer.map((b) => b.serialNumber),
      blockchainTx: {
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        blockNumber: 19845310,
        network: 'Base Mainnet (EVM)',
        contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        vaultReceiptHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        signature: '0xTransferSignature...'
      }
    };

    const txIn: TransactionRecord = {
      id: `${txId}_in`,
      userId: recipient.userId,
      type: 'TRANSFER_IN',
      tokenAmount: amount,
      goldGrams: +(amount * 10).toFixed(2),
      usdTotal: +(amount * currentSpot.pricePerToken10g).toFixed(2),
      spotPricePerGram: currentSpot.pricePerGram,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED_ONCHAIN',
      paymentMethod: 'USDC_INSTANT',
      vaultBarSerials: barsToTransfer.map((b) => b.serialNumber)
    };

    transactionsState.unshift(txOut, txIn);

    res.json({
      success: true,
      senderBalance: sender.goldBalance,
      recipientBalance: recipient.goldBalance,
      transferredAmount: amount
    });
  });

  // Physical Redemption endpoint
  app.post('/api/redeem', (req, res) => {
    const { userId, tokenAmount, shippingAddress, vaultLocation } = req.body;
    const amount = Number(tokenAmount);

    if (!userId || !amount || amount < 1) {
      return res.status(400).json({ error: 'Minimum physical redemption is 1.0 GOLD10 (10g bar).' });
    }

    const user = usersState[userId];
    if (!user || user.goldBalance < amount) {
      return res.status(400).json({ error: 'Insufficient GOLD10 balance for physical redemption.' });
    }

    // Burn / deduct balance
    user.goldBalance = +(user.goldBalance - amount).toFixed(4);
    const userBars = vaultBarsState[userId] || [];
    const redeemedBars = userBars.splice(0, Math.floor(amount));

    const deliveryId = `DISPATCH-ZRH-${Math.floor(100000 + Math.random() * 900000)}`;

    const txRecord: TransactionRecord = {
      id: `tx_redeem_${Date.now()}`,
      userId,
      type: 'PHYSICAL_REDEMPTION',
      tokenAmount: amount,
      goldGrams: +(amount * 10).toFixed(2),
      usdTotal: +(amount * currentSpot.pricePerToken10g).toFixed(2),
      spotPricePerGram: currentSpot.pricePerGram,
      timestamp: new Date().toISOString(),
      status: 'SETTLED',
      paymentMethod: 'USDC_INSTANT',
      vaultBarSerials: redeemedBars.map((b) => b.serialNumber),
      blockchainTx: {
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        blockNumber: 19845420,
        network: 'Base Mainnet (EVM)',
        contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        vaultReceiptHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        signature: '0xBurnSignature...'
      }
    };

    transactionsState.unshift(txRecord);

    res.json({
      success: true,
      deliveryId,
      redeemedBars,
      remainingBalance: user.goldBalance,
      courier: 'Loomis Armored & Insured Logistics',
      destination: shippingAddress || 'Zurich Secure Vault Transfer Desk'
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GOLD10 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
