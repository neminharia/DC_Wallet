import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import { ethers } from 'ethers';

interface TokenApprovalProps {
    tokenAddress: string;
    spenderAddress: string;
    amount: string;
    onApprove: () => Promise<void>;
    onReject: () => void;
}

interface TokenInfo {
    symbol: string;
    name: string;
    decimals: number;
}

export const TokenApproval: React.FC<TokenApprovalProps> = ({
    tokenAddress,
    spenderAddress,
    amount,
    onApprove,
    onReject
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    useEffect(() => {
        loadTokenInfo();
    }, [tokenAddress]);

    const loadTokenInfo = async () => {
        try {
            // Get token info
            const infoResponse = await chrome.runtime.sendMessage({
                type: 'GET_TOKEN_INFO',
                tokenAddress
            });

            if (infoResponse.success) {
                setTokenInfo(infoResponse.result);
            }

            // Get token balance
            const balanceResponse = await chrome.runtime.sendMessage({
                type: 'GET_TOKEN_BALANCE',
                tokenAddress
            });

            if (balanceResponse.success) {
                setBalance(balanceResponse.result);
            }
        } catch (err) {
            console.error('Error loading token info:', err);
        }
    };

    const handleApprove = async () => {
        try {
            setLoading(true);
            setError(null);
            await onApprove();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to approve token');
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatAmount = (amount: string, decimals: number) => {
        return ethers.utils.formatUnits(amount, decimals);
    };

    if (!tokenInfo) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ py: 2, textAlign: 'center' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ py: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Approve Token
                </Typography>

                <Paper sx={{ mb: 2 }}>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Token"
                                secondary={`${tokenInfo.name} (${tokenInfo.symbol})`}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Spender"
                                secondary={formatAddress(spenderAddress)}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Amount"
                                secondary={`${formatAmount(amount, tokenInfo.decimals)} ${tokenInfo.symbol}`}
                            />
                        </ListItem>
                        {balance && (
                            <>
                                <Divider />
                                <ListItem>
                                    <ListItemText
                                        primary="Your Balance"
                                        secondary={`${formatAmount(balance, tokenInfo.decimals)} ${tokenInfo.symbol}`}
                                    />
                                </ListItem>
                            </>
                        )}
                    </List>
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={onReject}
                        disabled={loading}
                    >
                        Reject
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApprove}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Approve'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}; 