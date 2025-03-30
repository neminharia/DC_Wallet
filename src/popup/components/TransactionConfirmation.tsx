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

interface TransactionConfirmationProps {
    transaction: {
        to: string;
        value: string;
        data?: string;
        gasLimit?: string;
        gasPrice?: string;
        maxFeePerGas?: string;
        maxPriorityFeePerGas?: string;
        nonce?: number;
    };
    onConfirm: () => Promise<void>;
    onReject: () => void;
}

export const TransactionConfirmation: React.FC<TransactionConfirmationProps> = ({
    transaction,
    onConfirm,
    onReject
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gasEstimate, setGasEstimate] = useState<string | null>(null);
    const [gasPrice, setGasPrice] = useState<string | null>(null);

    useEffect(() => {
        loadGasInfo();
    }, [transaction]);

    const loadGasInfo = async () => {
        try {
            // Get gas estimate
            const estimateResponse = await chrome.runtime.sendMessage({
                type: 'ESTIMATE_GAS',
                transaction
            });

            if (estimateResponse.success) {
                setGasEstimate(estimateResponse.result);
            }

            // Get current gas price
            const gasPriceResponse = await chrome.runtime.sendMessage({
                type: 'GET_GAS_PRICE'
            });

            if (gasPriceResponse.success) {
                setGasPrice(gasPriceResponse.result);
            }
        } catch (err) {
            console.error('Error loading gas info:', err);
        }
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            setError(null);
            await onConfirm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send transaction');
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatValue = (value: string) => {
        return `${ethers.utils.formatEther(value)} ETH`;
    };

    const formatGasPrice = (price: string) => {
        return `${ethers.utils.formatUnits(price, 'gwei')} Gwei`;
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ py: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Confirm Transaction
                </Typography>

                <Paper sx={{ mb: 2 }}>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="To"
                                secondary={formatAddress(transaction.to)}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Amount"
                                secondary={formatValue(transaction.value)}
                            />
                        </ListItem>
                        <Divider />
                        {gasEstimate && (
                            <ListItem>
                                <ListItemText
                                    primary="Gas Limit"
                                    secondary={gasEstimate}
                                />
                            </ListItem>
                        )}
                        {gasPrice && (
                            <ListItem>
                                <ListItemText
                                    primary="Gas Price"
                                    secondary={formatGasPrice(gasPrice)}
                                />
                            </ListItem>
                        )}
                        {transaction.data && (
                            <>
                                <Divider />
                                <ListItem>
                                    <ListItemText
                                        primary="Data"
                                        secondary={transaction.data}
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
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Confirm'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}; 