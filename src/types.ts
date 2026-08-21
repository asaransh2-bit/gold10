export interface UserProfile {
  userId: string;
  email: string;
  createdAt: string;
  goldBalance: number; // Number of GOLD10 tokens (each = 10g pure 24K gold)
  walletAddress?: string;
  kycStatus: 'verified' | 'pending' | 'unverified';
}

export interface VaultBar {
  serialNumber: string; // e.g. "G10-CH-994201"
  refinery: string; // "Argor-Heraeus (Switzerland)" | "Valcambi Suisse" | "PAMP SA"
  purity: string; // "999.9 Fine 24K"
  weightGrams: number; // 10.00g
  vaultLocation: string; // "Zurich Freeport, Switzerland" | "Le Freeport, Singapore" | "Brink's Vault, London"
  allocatedAt: string;
  auditCertificateId: string;
  merkleRootHash: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: 'MINT_PURCHASE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'PHYSICAL_REDEMPTION';
  tokenAmount: number; // In GOLD10
  goldGrams: number; // 10g * tokenAmount
  usdTotal: number;
  spotPricePerGram: number;
  timestamp: string;
  status: 'SETTLED' | 'PENDING' | 'CONFIRMED_ONCHAIN';
  paymentMethod: 'USDC_INSTANT' | 'BANK_WIRE' | 'CREDIT_CARD';
  vaultBarSerials: string[];
  blockchainTx?: {
    txHash: string;
    blockNumber: number;
    network: string;
    contractAddress: string;
    vaultReceiptHash: string;
    signature: string;
  };
}

export interface GoldSpotData {
  pricePerOunce: number;
  pricePerGram: number;
  pricePerToken10g: number;
  change24hPercent: number;
  change24hUsd: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

export interface EVMMintCalldata {
  contractAddress: string;
  recipient: string;
  tokenAmount: string;
  vaultReceiptHash: string;
  signature: string;
  nonce: number;
  rawCalldata: string;
}

export interface PurchaseRequestPayload {
  userId: string;
  tokenAmount: number;
  paymentMethod: 'USDC_INSTANT' | 'BANK_WIRE' | 'CREDIT_CARD';
  recipientWallet?: string;
}

export interface ArchitectureSnippet {
  id: string;
  title: string;
  filename: string;
  language: string;
  category: 'cloud_function' | 'react_sdk' | 'security_rules' | 'smart_contract';
  description: string;
  code: string;
  securityHighlights: string[];
}
