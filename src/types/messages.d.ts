interface ExtensionResponse {
  success: boolean;
  error?: string;
  result?: any;
}

type MessageType =
  | "CREATE_WALLET"
  | "UNLOCK_WALLET"
  | "LOCK_WALLET"
  | "GET_WALLET_STATE"
  | "SWITCH_NETWORK"
  | "SEND_TRANSACTION";

interface ExtensionMessage {
  type: MessageType;
  password?: string;
  network?: "ethereum" | "solana";
  to?: string;
  amount?: string;
}
