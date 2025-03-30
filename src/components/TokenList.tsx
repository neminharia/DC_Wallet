import React, { useState, useEffect } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Token, TokenService } from '../services/token/TokenService';

interface TokenListProps {
    network: string;
    walletAddress: string;
}

const TokenList: React.FC<TokenListProps> = ({ network, walletAddress }) => {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [newToken, setNewToken] = useState({
        address: '',
        symbol: '',
        decimals: '',
        name: '',
    });

    const tokenService = new TokenService(network);

    useEffect(() => {
        loadTokens();
    }, [network, walletAddress]);

    const loadTokens = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get both common and custom tokens
            const commonTokens = tokenService.getCommonTokens();
            const customTokens = await tokenService.getCustomTokens();
            const allTokens = [...commonTokens, ...customTokens];

            // Load balances for all tokens
            const tokensWithBalances = await Promise.all(
                allTokens.map(async (token) => {
                    try {
                        const balance = await tokenService.getTokenBalance(token.address, walletAddress);
                        return { ...token, balance };
                    } catch (err) {
                        console.error(`Error loading balance for token ${token.symbol}:`, err);
                        return { ...token, balance: '0' };
                    }
                })
            );

            setTokens(tokensWithBalances);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tokens');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToken = async () => {
        try {
            setError(null);

            // Validate token contract
            const isValid = await tokenService.validateTokenContract(newToken.address);
            if (!isValid) {
                throw new Error('Invalid token contract address');
            }

            await tokenService.addCustomToken({
                address: newToken.address,
                symbol: newToken.symbol,
                decimals: parseInt(newToken.decimals),
                name: newToken.name,
            });

            setOpenDialog(false);
            setNewToken({ address: '', symbol: '', decimals: '', name: '' });
            loadTokens();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add token');
        }
    };

    const handleRemoveToken = async (address: string) => {
        try {
            await tokenService.removeCustomToken(address);
            loadTokens();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove token');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <>
            <List>
                {tokens.map((token) => (
                    <ListItem
                        key={token.address}
                        secondaryAction={
                            <IconButton
                                edge="end"
                                onClick={() => handleRemoveToken(token.address)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemAvatar>
                            <Avatar src={token.logo} alt={token.symbol}>
                                {token.symbol[0]}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={token.name}
                            secondary={`${token.balance || '0'} ${token.symbol}`}
                        />
                    </ListItem>
                ))}
            </List>

            <Button
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                variant="contained"
                color="primary"
                fullWidth
            >
                Add Custom Token
            </Button>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add Custom Token</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Contract Address"
                        fullWidth
                        value={newToken.address}
                        onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Symbol"
                        fullWidth
                        value={newToken.symbol}
                        onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Decimals"
                        type="number"
                        fullWidth
                        value={newToken.decimals}
                        onChange={(e) => setNewToken({ ...newToken, decimals: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={newToken.name}
                        onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddToken} variant="contained">
                        Add Token
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TokenList; 