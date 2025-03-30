import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

interface SettingsProps {
  network: "ethereum" | "solana";
  onNetworkChange: (network: "ethereum" | "solana") => Promise<void>;
  onLockWallet: () => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({
  network,
  onNetworkChange,
  onLockWallet,
}) => {
  const handleNetworkChange = async (
    _: React.MouseEvent<HTMLElement>,
    newNetwork: "ethereum" | "solana"
  ) => {
    if (newNetwork !== null) {
      await onNetworkChange(newNetwork);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Settings
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Network
          </Typography>
          <ToggleButtonGroup
            value={network}
            exclusive
            onChange={handleNetworkChange}
            aria-label="network"
            fullWidth
          >
            <ToggleButton value="ethereum">Ethereum</ToggleButton>
            <ToggleButton value="solana">Solana</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Button
          variant="outlined"
          color="secondary"
          onClick={onLockWallet}
          fullWidth
        >
          Lock Wallet
        </Button>
      </CardContent>
    </Card>
  );
};

export default Settings;
