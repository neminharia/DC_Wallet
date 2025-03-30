import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { NETWORKS } from '../../config/networks';

export interface Token {
    address: string;
    symbol: string;
    decimals: number;
    name: string;
    logo?: string;
    balance?: string;
}

const STORAGE_KEY = 'custom_tokens';

export class TokenService {
    private provider: ethers.providers.JsonRpcProvider | Connection;
    private networkType: 'ethereum' | 'solana';

    constructor(network: string) {
        if (network.startsWith('solana')) {
            this.networkType = 'solana';
            this.provider = new Connection(NETWORKS[network].rpcUrl);
        } else {
            this.networkType = 'ethereum';
            this.provider = new ethers.providers.JsonRpcProvider(NETWORKS[network].rpcUrl);
        }
    }

    async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
        if (this.networkType === 'ethereum') {
            const tokenContract = new ethers.Contract(
                tokenAddress,
                ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
                this.provider as ethers.providers.JsonRpcProvider
            );

            const balance = await tokenContract.balanceOf(walletAddress);
            const decimals = await tokenContract.decimals();
            return ethers.utils.formatUnits(balance, decimals);
        } else {
            // For Solana tokens (simplified implementation)
            const tokenPubkey = new PublicKey(tokenAddress);
            const walletPubkey = new PublicKey(walletAddress);
            const balance = await (this.provider as Connection).getTokenAccountBalance(walletPubkey);
            return balance.value.uiAmount?.toString() || '0';
        }
    }

    async addCustomToken(token: Token): Promise<void> {
        const existingTokens = await this.getCustomTokens();
        const updatedTokens = [...existingTokens, token];
        await chrome.storage.local.set({ [STORAGE_KEY]: updatedTokens });
    }

    async removeCustomToken(tokenAddress: string): Promise<void> {
        const existingTokens = await this.getCustomTokens();
        const updatedTokens = existingTokens.filter(t => t.address !== tokenAddress);
        await chrome.storage.local.set({ [STORAGE_KEY]: updatedTokens });
    }

    async getCustomTokens(): Promise<Token[]> {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        return result[STORAGE_KEY] || [];
    }

    // Get common tokens for the current network
    getCommonTokens(): Token[] {
        if (this.networkType === 'ethereum') {
            return [
                {
                    address: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
                    symbol: 'USDT',
                    decimals: 6,
                    name: 'Tether USD',
                    logo: '/assets/token-icons/usdt.png'
                },
                {
                    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
                    symbol: 'USDC',
                    decimals: 6,
                    name: 'USD Coin',
                    logo: '/assets/token-icons/usdc.png'
                }
            ];
        } else {
            return [
                {
                    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
                    symbol: 'USDC',
                    decimals: 6,
                    name: 'USD Coin',
                    logo: '/assets/token-icons/usdc.png'
                }
            ];
        }
    }

    async validateTokenContract(address: string): Promise<boolean> {
        try {
            if (this.networkType === 'ethereum') {
                const code = await (this.provider as ethers.providers.JsonRpcProvider).getCode(address);
                return code !== '0x';
            } else {
                const info = await (this.provider as Connection).getParsedAccountInfo(new PublicKey(address));
                return info.value !== null;
            }
        } catch {
            return false;
        }
    }
} 