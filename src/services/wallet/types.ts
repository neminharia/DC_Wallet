import { NetworkConfig } from '../../config/networks';

export interface WalletBalance {
    amount: string;
    symbol: string;
    usdValue?: string;
}

export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
    network: string;
}

export interface WalletAccount {
    address: string;
    privateKey: string;
    network: string;
}

export interface IWalletProvider {
    network: NetworkConfig;

    // Account management
    createAccount(): Promise<WalletAccount>;
    importAccount(privateKey: string): Promise<WalletAccount>;
    getBalance(address: string): Promise<WalletBalance>;

    // Transaction operations
    sendTransaction(from: string, to: string, amount: string): Promise<string>;
    getTransaction(hash: string): Promise<Transaction>;
    getTransactionHistory(address: string): Promise<Transaction[]>;

    // Network operations
    validateAddress(address: string): boolean;
    estimateGasFee?(to: string, amount: string): Promise<string>;
} 