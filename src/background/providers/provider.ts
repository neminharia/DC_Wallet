import { ethers } from 'ethers';
import { Network, Account } from '../services/wallet';

export interface TransactionParams {
    to: string;
    value: string;
    data?: string;
    gasLimit?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: number;
}

export interface TokenInfo {
    address: string;
    symbol: string;
    decimals: number;
    name: string;
    logoURI?: string;
}

export abstract class Provider {
    protected provider: ethers.providers.JsonRpcProvider;
    protected network: Network;

    constructor(network: Network) {
        this.network = network;
        this.provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    }

    abstract getAccounts(): Promise<Account[]>;
    abstract getBalance(address: string): Promise<string>;
    abstract sendTransaction(params: TransactionParams): Promise<string>;
    abstract signMessage(address: string, message: string): Promise<string>;
    abstract getTransactionHistory(address: string): Promise<any[]>;
    abstract getTokenBalance(address: string, tokenAddress: string): Promise<string>;
    abstract getTokenInfo(tokenAddress: string): Promise<TokenInfo>;
    abstract approveToken(tokenAddress: string, spender: string, amount: string): Promise<string>;
    abstract transferToken(tokenAddress: string, to: string, amount: string): Promise<string>;

    async estimateGas(params: TransactionParams): Promise<string> {
        const gasEstimate = await this.provider.estimateGas({
            from: params.to,
            to: params.to,
            value: params.value,
            data: params.data
        });
        return gasEstimate.toString();
    }

    async getGasPrice(): Promise<string> {
        const gasPrice = await this.provider.getGasPrice();
        return gasPrice.toString();
    }

    async getBlockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }

    async getNetwork(): Promise<Network> {
        return this.network;
    }

    protected async getSigner(address: string, privateKey: string): Promise<ethers.Wallet> {
        return new ethers.Wallet(privateKey, this.provider);
    }
} 