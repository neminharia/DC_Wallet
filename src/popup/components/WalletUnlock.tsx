import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Link,
} from "@mui/material";
import PasswordInput from "./PasswordInput";

interface WalletUnlockProps {
  onUnlock: (password: string) => Promise<void>;
  onForgotPassword: () => void;
}

const WalletUnlock: React.FC<WalletUnlockProps> = ({ onUnlock, onForgotPassword }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    try {
      setError("");
      await onUnlock(password);
    } catch (err) {
      setError("Invalid password");
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Unlock Wallet
        </Typography>

        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <PasswordInput
            password={password}
            setPassword={setPassword}
            error={error}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleUnlock}
            disabled={!password}
            sx={{ mt: 2 }}
          >
            Unlock
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={onForgotPassword}
              sx={{ textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WalletUnlock;
