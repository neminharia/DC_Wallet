import React, { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  FormHelperText,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface PasswordInputProps {
  password: string;
  setPassword: (password: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (password: string) => void;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        fullWidth
        type={showPassword ? "text" : "password"}
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!error}
        sx={{ mb: setConfirmPassword ? 2 : 0 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {setConfirmPassword && (
        <TextField
          fullWidth
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!error}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowConfirmPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}

      {error && (
        <FormHelperText error>{error}</FormHelperText>
      )}
    </Box>
  );
};

export default PasswordInput;
