import { ethers } from "ethers";
import { Web3 } from "web3";
import { NETWORKS } from "../../config/networks";
import { EventEmitter } from "events";
import { generateMnemonic, mnemonicToEntropy } from "bip39";
import CryptoJS from "crypto-js";

export interface Network {
  chainId: string;
  name: string;
  rpcUrl: string;
  symbol: string;
  explorerUrl: string;
}

export interface Account {
  address: string;
  privateKey: string;
}

interface WalletStatus {
  isInitialized: boolean;
  isLocked: boolean;
  address: string | null;
  accounts: {
    [network: string]: Account[];
  };
  selectedNetwork: string;
}

export class WalletService {
  private mnemonic: string | null = null;
  private wallet: ethers.Wallet | null = null;
  private encryptedWallet: string | null = null;
  private web3!: Web3;
  private selectedNetwork: string = "ethereum";
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(20);
    this.initializeWeb3(NETWORKS.ganache.rpcUrl);
  }

  private initializeWeb3(rpcUrl: string) {
    if (this.provider) {
      this.provider.removeAllListeners();
    }

    if (this.web3?.currentProvider) {
      const provider = this.web3.currentProvider as any;
      if (provider.disconnect) {
        provider.disconnect();
      }
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.web3 = new Web3(rpcUrl);
    this.eventEmitter.removeAllListeners();
  }

  private encrypt(data: string, password: string): string {
    return CryptoJS.AES.encrypt(data, password).toString();
  }

  private decrypt(encryptedData: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async createWallet(password: string): Promise<void> {
    try {
      // Generate a new random mnemonic
      this.mnemonic = generateMnemonic();

      if (!this.provider) {
        throw new Error("Provider not initialized");
      }

      // Create a new wallet from the mnemonic
      this.wallet = ethers.Wallet.fromMnemonic(this.mnemonic).connect(this.provider);

      // Encrypt the mnemonic and private key
      const encryptedMnemonic = this.encrypt(this.mnemonic, password);
      const encryptedPrivateKey = this.encrypt(this.wallet.privateKey, password);

      // Save to storage
      await this.saveToStorage("isInitialized", true);
      await this.saveToStorage("isLocked", false);
      await this.saveToStorage("ethereumAddress", this.wallet.address);
      await this.saveToStorage("encryptedMnemonic", encryptedMnemonic);
      await this.saveToStorage("encryptedPrivateKey", encryptedPrivateKey);
      await this.saveToStorage("selectedNetwork", this.selectedNetwork);
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  }

  async getMnemonic(): Promise<string> {
    if (!this.mnemonic) {
      throw new Error("No mnemonic available");
    }
    return this.mnemonic;
  }

  async unlockWallet(password: string): Promise<void> {
    try {
      const encryptedMnemonic = await this.getFromStorage("encryptedMnemonic");
      const encryptedPrivateKey = await this.getFromStorage("encryptedPrivateKey");

      if (!encryptedMnemonic || !encryptedPrivateKey) {
        throw new Error("No wallet found");
      }

      // Decrypt the mnemonic and private key
      this.mnemonic = this.decrypt(encryptedMnemonic, password);
      const privateKey = this.decrypt(encryptedPrivateKey, password);

      if (!this.provider) {
        this.provider = new ethers.providers.JsonRpcProvider(NETWORKS.ganache.rpcUrl);
      }

      // Create wallet from private key
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      await this.saveToStorage("isLocked", false);
    } catch (error) {
      console.error("Error unlocking wallet:", error);
      throw error;
    }
  }

  async getWalletStatus(): Promise<WalletStatus> {
    try {
      const isInitialized = await this.getFromStorage("isInitialized") || false;
      const isLocked = await this.getFromStorage("isLocked") !== false;
      const selectedNetwork = await this.getFromStorage("selectedNetwork") || this.selectedNetwork;

      let accounts: Account[] = [];
      if (this.wallet) {
        accounts = [{ address: this.wallet.address, privateKey: this.wallet.privateKey }];
      } else {
        const address = await this.getFromStorage("ethereumAddress");
        if (address) {
          accounts = [{ address, privateKey: "" }];
        }
      }

      return {
        isInitialized,
        isLocked,
        address: accounts[0]?.address || null,
        accounts: {
          [selectedNetwork]: accounts
        },
        selectedNetwork
      };
    } catch (error) {
      console.error("Error getting wallet status:", error);
      return {
        isInitialized: false,
        isLocked: true,
        address: null,
        accounts: {},
        selectedNetwork: this.selectedNetwork
      };
    }
  }

  async lockWallet(): Promise<void> {
    this.wallet = null;
    await this.saveToStorage("isLocked", true);
  }

  async switchNetwork(network: string): Promise<void> {
    if (!(network in NETWORKS)) {
      throw new Error(`Network ${network} not supported`);
    }

    this.selectedNetwork = network;
    await this.saveToStorage("selectedNetwork", network);

    // Initialize new Web3 and provider instances
    this.initializeWeb3(NETWORKS[network].rpcUrl);

    if (this.wallet && this.provider) {
      // Update wallet with new provider
      this.wallet = this.wallet.connect(this.provider);
    }
  }

  private async saveToStorage(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          const error = chrome.runtime.lastError;
          if (error) {
            reject(new Error(error.message));
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async getFromStorage(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(key, (result) => {
          const error = chrome.runtime.lastError;
          if (error) {
            reject(new Error(error.message));
          } else {
            resolve(result[key]);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAddress(): Promise<string | null> {
    return this.wallet?.address || null;
  }

  async signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet is locked");
    }
    return await this.wallet.signTransaction(transaction);
  }

  async signMessage(message: string): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet is locked");
    }
    return await this.wallet.signMessage(message);
  }

  async getPrivateKey(address: string, password: string): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet is locked");
    }
    return this.wallet.privateKey;
  }
}
