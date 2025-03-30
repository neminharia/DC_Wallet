# Web3 Wallet Extension

A secure multi-chain cryptocurrency wallet browser extension that supports Ethereum and other EVM-compatible networks.

## Features

- Secure wallet creation and management
- Support for multiple accounts
- Multi-chain support (Ethereum, Polygon, etc.)
- ERC20 token support
- Transaction signing and approval
- Custom network support
- Auto-lock functionality
- Transaction history
- Gas estimation
- Network switching
- Token approvals
- Secure key storage
- Backup and restore functionality

## Development

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Chrome browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/web3-wallet-extension.git
cd web3-wallet-extension
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

### Building for Production

```bash
npm run build
```

The built extension will be available in the `dist` directory.

## Security Features

- Encrypted private key storage
- Secure key derivation (BIP44)
- Password protection
- Auto-lock functionality
- Transaction signing confirmation
- Phishing protection
- Secure backup and restore

## Architecture

The extension is built using:

- React for the UI
- TypeScript for type safety
- ethers.js for blockchain interactions
- Material-UI for styling
- Webpack for bundling

### Directory Structure

```
src/
├── assets/         # Static assets
├── background/     # Background scripts
├── content/        # Content scripts
├── popup/          # Popup UI components
├── types/          # TypeScript type definitions
└── config/         # Configuration files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MetaMask for inspiration
- Ethereum community
- React team
- Material-UI team 