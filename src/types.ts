export interface UserProfile {
  userId: string;
  name: string;
  email: string;

  walletAddress: string;

  // Stored balance in GOLD10 units.
  // 1 GOLD10 = 10 grams of gold in the application's accounting model.
  goldBalance: number;

  // Account cash balance, if enabled later.
  usdBalance: number;

  // Account status
  status: "active" | "suspended" | "pending";

  createdAt?: string;
  updatedAt?: string;
}

export interface GoldSpotData {
  pricePerGram: number;
  currency: "USD" | "INR";
  updatedAt: string;

  // Identifies where the displayed reference price came from.
  source?: string;
}

export interface VaultBar {
  id: string;
  serialNumber: string;

  vaultLocation: string;
  vaultProvider?: string;

  auditCertificateId?: string;

  weightGrams: number;
  purity: string;

  // Allocation state
  status:
    | "available"
    | "allocated"
    | "reserved"
    | "redeemed";

  allocatedGold10?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface PhysicalBacking {
  status:
    | "unallocated"
    | "allocated"
    | "reserved"
    | "redeemed";

  grams: number;

  barIds?: string[];

  vaultLocation?: string;

  auditCertificateId?: string;
}

export interface BlockchainTx {
  txHash?: string;

  network?:
    | "base"
    | "base-sepolia"
    | "ethereum"
    | "ethereum-sepolia";

  contractAddress?: string;

  blockNumber?: number;

  vaultReceiptHash?: string;

  signature?: string;

  gasUsed?: string;

  status:
    | "pending"
    | "confirmed"
    | "failed"
    | "not_minted";

  createdAt?: string;
}

export interface TransactionRecord {
  id: string;

  userId: string;

  timestamp: string;

  type:
    | "GOLD10_PURCHASE"
    | "GOLD10_TRANSFER"
    | "GOLD10_REDEMPTION"
    | "GOLD10_ALLOCATION"
    | "GOLD10_ADJUSTMENT";

  tokenAmount: number;

  goldGrams: number;

  status:
    | "pending"
    | "completed"
    | "failed"
    | "pending_settlement"
    | "cancelled";

  fromUserId?: string;
  toUserId?: string;

  fromWallet?: string;
  toWallet?: string;

  totalUsd?: number;
  feeUsd?: number;

  physicalBacking?: PhysicalBacking;

  blockchainTx?: BlockchainTx;

  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseRecord {
  id: string;

  userId: string;

  type: "GOLD10_PURCHASE";

  tokenAmount: number;

  goldGrams: number;

  spotPricePerGram: number;

  purchaseValueUsd: number;

  feeUsd: number;

  totalUsd: number;

  walletAddress: string;

  status:
    | "pending_payment"
    | "payment_received"
    | "pending_settlement"
    | "completed"
    | "failed"
    | "cancelled";

  physicalBacking: PhysicalBacking;

  blockchain?: BlockchainTx;

  createdAt?: string;
  updatedAt?: string;
}

export interface TransferRecord {
  id: string;

  fromUserId: string;
  toUserId?: string;

  fromWallet: string;
  toWallet: string;

  tokenAmount: number;

  goldGrams: number;

  status:
    | "pending"
    | "completed"
    | "failed"
    | "cancelled";

  createdAt?: string;
  updatedAt?: string;

  blockchainTx?: BlockchainTx;
}

export interface RedemptionRequest {
  id: string;

  userId: string;

  tokenAmount: number;

  goldGrams: number;

  status:
    | "requested"
    | "approved"
    | "processing"
    | "shipped"
    | "completed"
    | "rejected"
    | "cancelled";

  shippingStatus?: string;

  vaultBarIds?: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ArchitectureSnippet {
  id: string;

  title: string;

  filename: string;

  language: string;

  description: string;

  securityHighlights: string[];

  code: string;
}
