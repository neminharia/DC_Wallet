const { Web3 } = require('web3');

async function testGanacheConnection() {
    try {
        const web3 = new Web3('http://127.0.0.1:7545');
        
        // Test connection
        const accounts = await web3.eth.getAccounts();
        console.log('Connected to Ganache!');
        console.log('Available accounts:', accounts);
        
        // Test chain ID
        const chainId = await web3.eth.getChainId();
        console.log('Chain ID:', chainId);
        
    } catch (error) {
        console.error('Failed to connect to Ganache:', error);
    }
}

testGanacheConnection(); 