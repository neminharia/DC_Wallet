import { ethers } from "ethers";
import { Web3 } from "web3";
import { NETWORKS } from "../../config/networks";
import { WalletService } from "./wallet";

export interface TransactionParams {
  from: string;
  to: string;
  value: string;
  network?: string;
}

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  gasUsed: number;
  status: boolean;
}

export class TransactionService {
  private web3: Web3;
  private walletService: WalletService;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
    this.web3 = new Web3(NETWORKS.ganache.rpcUrl);
  }

  async sendTransaction(params: TransactionParams): Promise<TransactionResult> {
    try {
      // Switch network if specified
      if (params.network && params.network !== this.walletService.getSelectedNetwork()) {
        await this.walletService.switchNetwork(params.network);
      }

      // Get the current network's RPC URL
      const network = params.network || this.walletService.getSelectedNetwork();
      const rpcUrl = NETWORKS[network].rpcUrl;
      
      // Update web3 provider if needed
      if (this.web3.provider?.constructor.name !== 'Web3Provider') {
        this.web3 = new Web3(rpcUrl);
      }

      // Get the wallet's private key
      const privateKey = await this.walletService.getPrivateKey(params.from, "");
      
      // Create transaction
      const transaction = {
        from: params.from,
        to: params.to,
        value: this.web3.utils.toWei(params.value, "ether"),
        gas: 21000,
        gasPrice: await this.web3.eth.getGasPrice()
      };

      // Sign and send transaction
      const signedTx = await this.web3.eth.accounts.signTransaction(transaction, privateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      return {
        hash: receipt.transactionHash.toString(),
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
        status: true
      };
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }

  async getBalance(address: string, network?: string): Promise<string> {
    try {
      // Switch network if specified
      if (network && network !== this.walletService.getSelectedNetwork()) {
        await this.walletService.switchNetwork(network);
      }

      // Get the current network's RPC URL
      const currentNetwork = network || this.walletService.getSelectedNetwork();
      const rpcUrl = NETWORKS[currentNetwork].rpcUrl;
      
      // Update web3 provider if needed
      if (this.web3.provider?.constructor.name !== 'Web3Provider') {
        this.web3 = new Web3(rpcUrl);
      }

      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, "ether");
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }

  async estimateGas(params: TransactionParams): Promise<string> {
    try {
      // Switch network if specified
      if (params.network && params.network !== this.walletService.getSelectedNetwork()) {
        await this.walletService.switchNetwork(params.network);
      }

      // Get the current network's RPC URL
      const network = params.network || this.walletService.getSelectedNetwork();
      const rpcUrl = NETWORKS[network].rpcUrl;
      
      // Update web3 provider if needed
      if (this.web3.provider?.constructor.name !== 'Web3Provider') {
        this.web3 = new Web3(rpcUrl);
      }

      const gasPrice = await this.web3.eth.getGasPrice();
      return this.web3.utils.fromWei(gasPrice, "gwei");
    } catch (error) {
      console.error("Error estimating gas:", error);
      throw error;
    }
  }
} 