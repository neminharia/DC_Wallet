import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";

interface SendTransactionProps {
  network: "ethereum" | "solana";
  onSend: (to: string, amount: string) => Promise<void>;
  balance: string;
  isGanache: boolean;
  fromAddress: string;
}

const SendTransaction: React.FC<SendTransactionProps> = ({
  network,
  onSend,
  balance,
  isGanache,
  fromAddress,
}) => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setError("");
      setLoading(true);
      await onSend(to, amount);
      setTo("");
      setAmount("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send transaction");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Send {network === "ethereum" ? "ETH" : "SOL"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Recipient Address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            fullWidth
            placeholder={`Enter ${network} address`}
          />

          <TextField
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            type="number"
            placeholder="0.0"
          />

          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!to || !amount || loading}
            fullWidth
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SendTransaction;
