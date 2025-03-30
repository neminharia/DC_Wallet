import React from 'react';
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import { NETWORKS } from '../config/networks';

interface NetworkSelectorProps {
    selectedNetwork: string;
    onNetworkChange: (network: string) => void;
    isLoading?: boolean;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
    selectedNetwork,
    onNetworkChange,
    isLoading = false,
}) => {
    const [error, setError] = React.useState<string | null>(null);
    const networks = Object.entries(NETWORKS);

    const handleNetworkChange = async (newNetwork: string) => {
        try {
            setError(null);
            await onNetworkChange(newNetwork);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to switch network');
        }
    };

    return (
        <Box sx={{ minWidth: 200, mb: 2 }}>
            <FormControl fullWidth disabled={isLoading}>
                <InputLabel id="network-select-label">Network</InputLabel>
                <Select
                    labelId="network-select-label"
                    id="network-select"
                    value={selectedNetwork}
                    label="Network"
                    onChange={(e) => handleNetworkChange(e.target.value)}
                    startAdornment={
                        isLoading ? (
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                        ) : null
                    }
                >
                    {networks.map(([key, network]) => (
                        <MenuItem key={key} value={key}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {network.icon && (
                                    <img
                                        src={`/assets/network-icons/${network.icon}`}
                                        alt={network.name}
                                        style={{ width: 20, height: 20, marginRight: 8 }}
                                    />
                                )}
                                {network.name}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NetworkSelector; 