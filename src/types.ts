export interface UserProfile{userId:string;name:string;email:string;walletAddress:string;goldBalance:number;usdBalance:number}
export interface GoldSpotData{pricePerGram:number;currency:string;updatedAt:string}
export interface VaultBar{serialNumber:string;vaultLocation:string;auditCertificateId:string;weightGrams:number;purity:string}
export interface BlockchainTx{txHash:string;blockNumber:number;vaultReceiptHash:string;signature:string;gasUsed:string}
export interface TransactionRecord{id:string;timestamp:string;type:string;tokenAmount:number;goldGrams:number;status:string;blockchainTx?:BlockchainTx}
export interface ArchitectureSnippet{id:string;title:string;filename:string;language:string;description:string;securityHighlights:string[];code:string}
