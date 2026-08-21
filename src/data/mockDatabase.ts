import { UserProfile, VaultBar, TransactionRecord, GoldSpotData } from '../types';

export const INITIAL_USERS: Record<string, UserProfile> = {
  'usr_asaransh2': {
    userId: 'usr_asaransh2',
    email: 'asaransh2@gmail.com',
    createdAt: '2026-08-10T08:30:00Z',
    goldBalance: 5.0, // 5 GOLD10 tokens = 50.00g physical 24K gold
    walletAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    kycStatus: 'verified'
  },
  'usr_swiss_vault_audit': {
    userId: 'usr_swiss_vault_audit',
    email: 'auditor@pwc-swissvaults.ch',
    createdAt: '2026-08-01T10:00:00Z',
    goldBalance: 25.0, // 250.00g
    walletAddress: '0x3cD751E6b0078Be393132286c442345e5DC49699',
    kycStatus: 'verified'
  },
  'usr_demo_trader': {
    userId: 'usr_demo_trader',
    email: 'institutional-trader@singapore-capital.sg',
    createdAt: '2026-08-15T14:15:00Z',
    goldBalance: 12.5, // 125.00g
    walletAddress: '0x1Db3439a222C519ab44bb1144fC28167b4Fa6EE6',
    kycStatus: 'verified'
  }
};

export const INITIAL_VAULT_BARS: Record<string, VaultBar[]> = {
  'usr_asaransh2': [
    {
      serialNumber: 'G10-CH-884920',
      refinery: 'Argor-Heraeus (Mendrisio, Switzerland)',
      purity: '999.9 Fine 24K Gold',
      weightGrams: 10.0,
      vaultLocation: 'Zurich Freeport Vault Zone B-12, Switzerland',
      allocatedAt: '2026-08-10T08:35:00Z',
      auditCertificateId: 'LBMA-CH-884920-VERIFIED',
      merkleRootHash: '0x7b23cf49d21e87900b4676579998064e4ff81432f913d8d32890539f3796f6e2'
    },
    {
      serialNumber: 'G10-CH-884921',
      refinery: 'Argor-Heraeus (Mendrisio, Switzerland)',
      purity: '999.9 Fine 24K Gold',
      weightGrams: 10.0,
      vaultLocation: 'Zurich Freeport Vault Zone B-12, Switzerland',
      allocatedAt: '2026-08-10T08:35:00Z',
      auditCertificateId: 'LBMA-CH-884921-VERIFIED',
      merkleRootHash: '0x8c34ea50e32f98011c5787680009175f50092543fa24e9e43901640a4807a7f3'
    },
    {
      serialNumber: 'G10-SG-910244',
      refinery: 'Valcambi Suisse (Balerna, Switzerland)',
      purity: '999.9 Fine 24K Gold',
      weightGrams: 10.0,
      vaultLocation: 'Le Freeport High-Security Vault A, Singapore',
      allocatedAt: '2026-08-12T11:20:00Z',
      auditCertificateId: 'LBMA-SG-910244-VERIFIED',
      merkleRootHash: '0x3f51bd72e65c09344d6910813331408e733b5876cd57d0d76134873d7039c9b5'
    },
    {
      serialNumber: 'G10-SG-910245',
      refinery: 'Valcambi Suisse (Balerna, Switzerland)',
      purity: '999.9 Fine 24K Gold',
      weightGrams: 10.0,
      vaultLocation: 'Le Freeport High-Security Vault A, Singapore',
      allocatedAt: '2026-08-12T11:20:00Z',
      auditCertificateId: 'LBMA-SG-910245-VERIFIED',
      merkleRootHash: '0x4a62ce83f76d10455e7021924442519f844c6987de68e1e87245984e8140da0c'
    },
    {
      serialNumber: 'G10-UK-772190',
      refinery: 'PAMP SA (Castel San Pietro, Switzerland)',
      purity: '999.9 Fine 24K Gold',
      weightGrams: 10.0,
      vaultLocation: "Brink's Global Services Vault 3, London, UK",
      allocatedAt: '2026-08-14T16:05:00Z',
      auditCertificateId: 'LBMA-UK-772190-VERIFIED',
      merkleRootHash: '0x1e89aa94b87e21566f8132035553620a955d7098ef79f2e98356095f9251eb1d'
    }
  ]
};

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx_init_884920',
    userId: 'usr_asaransh2',
    type: 'MINT_PURCHASE',
    tokenAmount: 2.0,
    goldGrams: 20.0,
    usdTotal: 1710.0,
    spotPricePerGram: 85.50,
    timestamp: '2026-08-10T08:35:00Z',
    status: 'CONFIRMED_ONCHAIN',
    paymentMethod: 'USDC_INSTANT',
    vaultBarSerials: ['G10-CH-884920', 'G10-CH-884921'],
    blockchainTx: {
      txHash: '0x8f7d921b34c8928001e74a839f99201fba45c61298418ab729104037592fa401',
      blockNumber: 19842103,
      network: 'Base Mainnet (EVM)',
      contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      vaultReceiptHash: '0x7b23cf49d21e87900b4676579998064e4ff81432f913d8d32890539f3796f6e2',
      signature: '0x49c81920eb91723fa8192038592182049102837482910293847192038102938172938102938471920381920381920381920381920381920381920381920381921c'
    }
  },
  {
    id: 'tx_init_910244',
    userId: 'usr_asaransh2',
    type: 'MINT_PURCHASE',
    tokenAmount: 2.0,
    goldGrams: 20.0,
    usdTotal: 1714.0,
    spotPricePerGram: 85.70,
    timestamp: '2026-08-12T11:20:00Z',
    status: 'CONFIRMED_ONCHAIN',
    paymentMethod: 'BANK_WIRE',
    vaultBarSerials: ['G10-SG-910244', 'G10-SG-910245'],
    blockchainTx: {
      txHash: '0x3a4b5c6d7e8f901234567890abcdef1234567890abcdef1234567890abcdef12',
      blockNumber: 19843912,
      network: 'Base Mainnet (EVM)',
      contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      vaultReceiptHash: '0x3f51bd72e65c09344d6910813331408e733b5876cd57d0d76134873d7039c9b5',
      signature: '0x992018471293847192837491029384719203819203819203819203819203819203819203819203819203819203819203819203819203819203819203819203811b'
    }
  },
  {
    id: 'tx_init_772190',
    userId: 'usr_asaransh2',
    type: 'MINT_PURCHASE',
    tokenAmount: 1.0,
    goldGrams: 10.0,
    usdTotal: 856.5,
    spotPricePerGram: 85.65,
    timestamp: '2026-08-14T16:05:00Z',
    status: 'CONFIRMED_ONCHAIN',
    paymentMethod: 'USDC_INSTANT',
    vaultBarSerials: ['G10-UK-772190'],
    blockchainTx: {
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: 19845100,
      network: 'Base Mainnet (EVM)',
      contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      vaultReceiptHash: '0x1e89aa94b87e21566f8132035553620a955d7098ef79f2e98356095f9251eb1d',
      signature: '0x819203819203819203819203819203819203819203819203819203819203819203819203819203819203819203819203819203819203819203819203819203811c'
    }
  }
];

export const INITIAL_SPOT_DATA: GoldSpotData = {
  pricePerOunce: 2659.80,
  pricePerGram: 85.51,
  pricePerToken10g: 855.10, // 10 grams * 85.51
  change24hPercent: 0.84,
  change24hUsd: 22.10,
  high24h: 2668.50,
  low24h: 2638.10,
  lastUpdated: new Date().toISOString()
};
