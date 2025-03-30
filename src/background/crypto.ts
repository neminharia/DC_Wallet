import { generateMnemonic, mnemonicToSeed } from "bip39";
import { Wallet, ethers } from "ethers";
import { Keypair } from "@solana/web3.js";
import CryptoJS from "crypto-js";

export interface WalletAccount {
  address: string;
  privateKey: string;
}

export class CryptoManager {
  private encryptionKey: string | null = null;

  setEncryptionKey(password: string) {
    this.encryptionKey = password;
  }

  clearEncryptionKey() {
    this.encryptionKey = null;
  }

  private encrypt(data: string): string {
    if (!this.encryptionKey) throw new Error("Wallet is locked");
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  private decrypt(encrypted: string): string {
    if (!this.encryptionKey) throw new Error("Wallet is locked");
    const bytes = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async generateWallet(): Promise<{ mnemonic: string; ethereumAccount: WalletAccount; solanaAccount: WalletAccount }> {
    const mnemonic = generateMnemonic();

    // Generate Ethereum account
    const ethereumWallet = ethers.Wallet.fromMnemonic(mnemonic);
    const ethereumAccount = {
      address: ethereumWallet.address,
      privateKey: ethereumWallet.privateKey,
    };

    // Generate Solana account
    const seed = await mnemonicToSeed(mnemonic);
    const solanaKeypair = Keypair.fromSeed(seed.slice(0, 32));
    const solanaAccount = {
      address: solanaKeypair.publicKey.toString(),
      privateKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
    };

    return {
      mnemonic: this.encrypt(mnemonic),
      ethereumAccount: {
        address: ethereumAccount.address,
        privateKey: this.encrypt(ethereumAccount.privateKey),
      },
      solanaAccount: {
        address: solanaAccount.address,
        privateKey: this.encrypt(solanaAccount.privateKey),
      },
    };
  }

  async signTransaction(network: "ethereum" | "solana", privateKey: string, transaction: any): Promise<string> {
    const decryptedKey = this.decrypt(privateKey);

    if (network === "ethereum") {
      const wallet = new Wallet(decryptedKey);
      return wallet.signTransaction(transaction);
    } else {
      const keypair = Keypair.fromSecretKey(
        Buffer.from(decryptedKey, "hex")
      );
      return transaction.sign([keypair]);
    }
  }
}
