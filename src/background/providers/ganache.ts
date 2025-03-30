import { Web3 } from "web3";
import { NETWORKS } from "../../config/networks";
import { BaseProvider } from "./base";
import { WalletService } from "../services/wallet";

export class GanacheProvider extends BaseProvider {
  private web3: Web3;
  private walletService: WalletService;

  constructor(walletService: WalletService) {
    super();
    this.web3 = new Web3(NETWORKS.ganache.rpcUrl);
    this.walletService = walletService;
  }

  async getAccounts(): Promise<string[]> {
    try {
      return await this.web3.eth.getAccounts();
    } catch (error) {
      console.error("Failed to get accounts:", error);
      return [];
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance.toString(), "ether");
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0";
    }
  }

  async sendTransaction(params: {
    from: string;
    to: string;
    value: string;
  }): Promise<string> {
    try {
      const tx = await this.web3.eth.sendTransaction({
        from: params.from,
        to: params.to,
        value: this.web3.utils.toWei(params.value, "ether"),
      });
      
      if (typeof tx === "string") {
        return tx;
      } else if (tx && typeof tx === "object" && "transactionHash" in tx) {
        return tx.transactionHash as string;
      }
      throw new Error("Invalid transaction response");
    } catch (error) {
      console.error("Failed to send transaction:", error);
      throw error;
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      return this.web3.utils.fromWei(gasPrice.toString(), "gwei");
    } catch (error) {
      console.error("Failed to get gas price:", error);
      return "0";
    }
  }

  async signMessage(address: string, message: string): Promise<string> {
    try {
      const messageHex = this.web3.utils.utf8ToHex(message);
      const signature = await this.web3.eth.sign(messageHex, address);
      
      if (typeof signature === "string") {
        return signature;
      } else if (signature && typeof signature === "object" && "signature" in signature) {
        return signature.signature;
      }
      throw new Error("Invalid signature response");
    } catch (error) {
      console.error("Failed to sign message:", error);
      throw error;
    }
  }
}
