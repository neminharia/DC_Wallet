import { ethers } from 'ethers';
import { NetworkConfig } from '../../../config/networks';
import { IWalletProvider, WalletAccount, WalletBalance, Transaction } from '../types';

export class EthereumProvider implements IWalletProvider {
    private provider: ethers.providers.JsonRpcProvider;

    constructor(public network: NetworkConfig) {
        this.provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    }

    async createAccount(): Promise<WalletAccount> {
        const wallet = ethers.Wallet.createRandom().connect(this.provider);
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            network: this.network.name
        };
    }

    async importAccount(privateKey: string): Promise<WalletAccount> {
        const wallet = new ethers.Wallet(privateKey, this.provider);
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            network: this.network.name
        };
    }

    async getBalance(address: string): Promise<WalletBalance> {
        const balance = await this.provider.getBalance(address);
        return {
            amount: ethers.utils.formatEther(balance),
            symbol: this.network.symbol
        };
    }

    async sendTransaction(from: string, to: string, amount: string): Promise<string> {
        const wallet = new ethers.Wallet(from, this.provider);
        const tx = await wallet.sendTransaction({
            to,
            value: ethers.utils.parseEther(amount)
        });
        return tx.hash;
    }

    async getTransaction(hash: string): Promise<Transaction> {
        const tx = await this.provider.getTransaction(hash);
        const receipt = await this.provider.getTransactionReceipt(hash);
        const block = await this.provider.getBlock(tx.blockNumber || 0);

        return {
            hash: tx.hash,
            from: tx.from,
            to: tx.to || '',
            value: ethers.utils.formatEther(tx.value),
            timestamp: block.timestamp,
            status: receipt?.status === 1 ? 'confirmed' : 'failed',
            network: this.network.name
        };
    }

    async getTransactionHistory(address: string): Promise<Transaction[]> {
        // Note: This is a simplified implementation. In production, you'd want to use an indexer or API
        const blockNumber = await this.provider.getBlockNumber();
        const block = await this.provider.getBlock(blockNumber);
        const transactions: Transaction[] = [];

        for (const txHash of block.transactions.slice(0, 10)) {
            const tx = await this.getTransaction(txHash);
            if (tx.from.toLowerCase() === address.toLowerCase() ||
                tx.to.toLowerCase() === address.toLowerCase()) {
                transactions.push(tx);
            }
        }

        return transactions;
    }

    validateAddress(address: string): boolean {
        return ethers.utils.isAddress(address);
    }

    async estimateGasFee(to: string, amount: string): Promise<string> {
        const gasPrice = await this.provider.getGasPrice();
        const gasLimit = await this.provider.estimateGas({
            to,
            value: ethers.utils.parseEther(amount)
        });
        return ethers.utils.formatEther(gasPrice.mul(gasLimit));
    }
} 