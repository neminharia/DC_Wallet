import { NETWORKS } from '../../config/networks';
import { WalletProviderFactory } from './providerFactory';
import { IWalletProvider, WalletAccount, WalletBalance, Transaction } from './types';
import { ethers } from 'ethers';

const STORAGE_KEYS = {
    ENCRYPTED_KEYS: 'encrypted_keys',
    SELECTED_NETWORK: 'selected_network',
    ACCOUNTS: 'accounts'
};

export class WalletService {
    private provider: IWalletProvider;
    private accounts: { [network: string]: WalletAccount[] } = {};
    private selectedNetwork: string = 'ethereum';

    constructor(network: string = 'ethereum') {
        this.selectedNetwork = network;
        this.provider = WalletProviderFactory.createProvider(NETWORKS[network]);
        this.loadState();
    }

    private async loadState() {
        const result = await chrome.storage.local.get([
            STORAGE_KEYS.SELECTED_NETWORK,
            STORAGE_KEYS.ACCOUNTS
        ]);

        if (result[STORAGE_KEYS.SELECTED_NETWORK]) {
            this.selectedNetwork = result[STORAGE_KEYS.SELECTED_NETWORK];
            this.provider = WalletProviderFactory.createProvider(NETWORKS[this.selectedNetwork]);
        }

        if (result[STORAGE_KEYS.ACCOUNTS]) {
            this.accounts = result[STORAGE_KEYS.ACCOUNTS];
        }
    }

    private async saveState() {
        await chrome.storage.local.set({
            [STORAGE_KEYS.SELECTED_NETWORK]: this.selectedNetwork,
            [STORAGE_KEYS.ACCOUNTS]: this.accounts
        });
    }

    async switchNetwork(network: string): Promise<void> {
        if (!NETWORKS[network]) {
            throw new Error(`Network ${network} not supported`);
        }
        this.selectedNetwork = network;
        this.provider = WalletProviderFactory.createProvider(NETWORKS[network]);
        await this.saveState();
    }

    async createWallet(password: string): Promise<WalletAccount> {
        const account = await this.provider.createAccount();
        this.accounts[this.selectedNetwork] = [account];

        // Encrypt and store the private key
        const encryptedKey = await this.encryptPrivateKey(account.privateKey, password);
        await this.storeEncryptedKey(account.address, encryptedKey);
        await this.saveState();

        return account;
    }

    async importWallet(privateKey: string, password: string): Promise<WalletAccount> {
        const account = await this.provider.importAccount(privateKey);
        this.accounts[this.selectedNetwork] = [account];

        // Encrypt and store the private key
        const encryptedKey = await this.encryptPrivateKey(account.privateKey, password);
        await this.storeEncryptedKey(account.address, encryptedKey);
        await this.saveState();

        return account;
    }

    private async storeEncryptedKey(address: string, encryptedKey: string) {
        const result = await chrome.storage.local.get(STORAGE_KEYS.ENCRYPTED_KEYS);
        const encryptedKeys = result[STORAGE_KEYS.ENCRYPTED_KEYS] || {};
        encryptedKeys[address] = encryptedKey;
        await chrome.storage.local.set({ [STORAGE_KEYS.ENCRYPTED_KEYS]: encryptedKeys });
    }

    private async getEncryptedKey(address: string): Promise<string> {
        const result = await chrome.storage.local.get(STORAGE_KEYS.ENCRYPTED_KEYS);
        const encryptedKeys = result[STORAGE_KEYS.ENCRYPTED_KEYS] || {};
        const encryptedKey = encryptedKeys[address];
        if (!encryptedKey) {
            throw new Error('Encrypted key not found');
        }
        return encryptedKey;
    }

    async getBalance(address: string): Promise<WalletBalance> {
        return this.provider.getBalance(address);
    }

    async sendTransaction(to: string, amount: string, password: string): Promise<string> {
        const account = this.accounts[this.selectedNetwork][0];
        if (!account) {
            throw new Error('No account found for the current network');
        }

        const encryptedKey = await this.getEncryptedKey(account.address);
        const privateKey = await this.decryptPrivateKey(encryptedKey, password);

        return this.provider.sendTransaction(privateKey, to, amount);
    }

    async getTransactionHistory(address: string): Promise<Transaction[]> {
        return this.provider.getTransactionHistory(address);
    }

    getCurrentNetwork(): string {
        return this.selectedNetwork;
    }

    getAccounts(): WalletAccount[] {
        return this.accounts[this.selectedNetwork] || [];
    }

    validateAddress(address: string): boolean {
        return this.provider.validateAddress(address);
    }

    private async encryptPrivateKey(privateKey: string, password: string): Promise<string> {
        const wallet = new ethers.Wallet(privateKey);
        return wallet.encrypt(password);
    }

    private async decryptPrivateKey(encryptedKey: string, password: string): Promise<string> {
        const wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, password);
        return wallet.privateKey;
    }

    async clearStorage(): Promise<void> {
        await chrome.storage.local.clear();
        this.accounts = {};
        this.selectedNetwork = 'ethereum';
        this.provider = WalletProviderFactory.createProvider(NETWORKS[this.selectedNetwork]);
    }
} 