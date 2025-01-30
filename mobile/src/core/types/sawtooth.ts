export interface TransactionPayload {
    property_id: string;
    new_owner: string;
    timestamp: number;
    metadata?: any;
}

export interface MerkleProof {
    root_hash: string;
    proof_nodes: string[];
    leaf_hash: string;
}

export type NetworkStatus = 'online' | 'offline';

export interface PendingTransaction {
    id: string;
    payload: TransactionPayload;
    timestamp: string;
    merkleProof?: MerkleProof;
    status: TransactionStatus;
}

export enum TransactionStatus {
    Pending = 'PENDING',
    Submitted = 'SUBMITTED',
    Confirmed = 'CONFIRMED',
    Failed = 'FAILED',
}

export interface StateProof {
    address: string;
    value: Uint8Array;
    proof: MerkleProof;
}

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

export interface TransactionResult {
    transactionId: string;
    status: TransactionStatus;
    error?: string;
}

export interface SawtoothBridge {
    // Transaction Management
    submitTransaction(payload: TransactionPayload): Promise<string>;
    queueTransaction(payload: TransactionPayload): Promise<string>;
    getPendingTransactions(): Promise<PendingTransaction[]>;
    
    // State Management
    getState(address: string): Promise<Uint8Array | null>;
    verifyState(proof: MerkleProof): Promise<boolean>;
    
    // Network Management
    setNetworkStatus(status: NetworkStatus): Promise<void>;
    syncPendingTransactions(): Promise<string[]>;
    
    // Key Management
    generateKey(): Promise<string>;
    importKey(key: string): Promise<void>;
    signTransaction(txId: string): Promise<string>;
} 