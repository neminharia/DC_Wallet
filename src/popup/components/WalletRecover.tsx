import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  TextField,
} from "@mui/material";
import PasswordInput from "./PasswordInput";

interface WalletRecoverProps {
  onRecover: (seedPhrase: string, newPassword: string) => Promise<void>;
  onCancel: () => void;
}

const WalletRecover: React.FC<WalletRecoverProps> = ({ onRecover, onCancel }) => {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRecover = async () => {
    try {
      setError("");
      
      // Validate seed phrase
      if (!seedPhrase.trim()) {
        throw new Error("Please enter your recovery phrase");
      }

      // Basic validation of seed phrase format (12 or 24 words)
      const words = seedPhrase.trim().split(/\s+/);
      if (words.length !== 12 && words.length !== 24) {
        throw new Error("Invalid recovery phrase. Please enter 12 or 24 words");
      }

      // Validate password
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await onRecover(seedPhrase.trim(), password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to recover wallet");
      }
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Recover Wallet
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your 12 or 24-word recovery phrase to restore your wallet
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Recovery Phrase"
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          placeholder="Enter your recovery phrase (12 or 24 words)"
          sx={{ mb: 2 }}
        />

        <PasswordInput
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          error={error}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleRecover}
            disabled={!seedPhrase || !password || !confirmPassword}
          >
            Recover Wallet
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WalletRecover; 