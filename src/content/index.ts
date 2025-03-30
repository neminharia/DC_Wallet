import { EthereumProvider } from "./providers/ethereum";
import { SolanaProvider } from "./providers/solana";

class ContentScript {
  private ethereumProvider: EthereumProvider;
  private solanaProvider: SolanaProvider;

  constructor() {
    this.ethereumProvider = EthereumProvider.getInstance();
    this.solanaProvider = SolanaProvider.getInstance();
    this.initialize();
  }

  private initialize() {
    // Define window properties using proper types
    Object.defineProperty(window, "ethereum", {
      value: this.ethereumProvider,
      writable: false,
      configurable: true,
    });

    Object.defineProperty(window, "solana", {
      value: this.solanaProvider,
      writable: false,
      configurable: true,
    });

    // Listen for messages from the page
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  private async handleMessage(event: MessageEvent) {
    try {
      if (event.data.type !== "WEB3_WALLET_REQUEST") return;

      const { provider, method, params, id } = event.data;
      let result;

      if (provider === "ethereum") {
        result = await this.ethereumProvider.request({
          method,
          params: params || []
        });
      } else if (provider === "solana") {
        switch (method) {
          case "connect":
            result = await this.solanaProvider.connect();
            break;
          case "disconnect":
            result = await this.solanaProvider.disconnect();
            break;
          case "signTransaction":
            result = await this.solanaProvider.signTransaction(params[0]);
            break;
          case "signAllTransactions":
            result = await this.solanaProvider.signAllTransactions(params[0]);
            break;
          case "signMessage":
            result = await this.solanaProvider.signMessage(new Uint8Array(params[0]));
            break;
          default:
            throw new Error("Unknown method");
        }
      } else {
        throw new Error("Unknown provider");
      }

      window.postMessage(
        {
          type: "WEB3_WALLET_RESPONSE",
          id,
          result,
        },
        "*"
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      window.postMessage(
        {
          type: "WEB3_WALLET_RESPONSE",
          id: event.data.id,
          error: errorMessage,
        },
        "*"
      );
    }
  }
}

// Initialize content script
new ContentScript();
