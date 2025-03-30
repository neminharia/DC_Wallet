import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { ContentCopy, OpenInNew } from "@mui/icons-material";
import { formatAddress, getExplorerUrl } from "../utils/wallet";

interface AccountListProps {
  accounts: string[];
  network: "ethereum" | "solana";
  onCopyAddress: (address: string) => void;
}

const AccountList: React.FC<AccountListProps> = ({
  accounts,
  network,
  onCopyAddress,
}) => {
  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    onCopyAddress(address);
  };

  const handleOpenExplorer = (address: string) => {
    const url = getExplorerUrl(network, "address", address);
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">Accounts</Typography>
          <Button variant="outlined" size="small">
            Add Account
          </Button>
        </Box>

        <List>
          {accounts.map((address, index) => (
            <ListItem
              key={address}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="copy"
                    onClick={() => handleCopy(address)}
                  >
                    <ContentCopy />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="view in explorer"
                    onClick={() => handleOpenExplorer(address)}
                  >
                    <OpenInNew />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={`Account ${index + 1}`}
                secondary={formatAddress(address)}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default AccountList;
