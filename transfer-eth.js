const { Web3 } = require('web3');

async function transferETH() {
    try {
        // Connect to Ganache
        const web3 = new Web3('http://127.0.0.1:7545');
        
        // Get the first account from Ganache (this will be our source)
        const accounts = await web3.eth.getAccounts();
        const sourceAddress = accounts[0];
        const destinationAddress = "0x84a5861EDDF07f121DBF60868E282a61abe791d7";

        console.log('Source address:', sourceAddress);
        console.log('Destination address:', destinationAddress);

        // Get initial balances
        const initialSourceBalance = await web3.eth.getBalance(sourceAddress);
        console.log('Initial source balance:', web3.utils.fromWei(initialSourceBalance, 'ether'), 'ETH');

        // Create transaction
        const transaction = {
            from: sourceAddress,
            to: destinationAddress,
            value: web3.utils.toWei('1', 'ether'), // Transfer 1 ETH
            gas: 21000,
            gasPrice: web3.utils.toWei('50', 'gwei')
        };

        // Send transaction
        const receipt = await web3.eth.sendTransaction(transaction);

        console.log('\nTransaction successful!');
        console.log('Transaction hash:', receipt.transactionHash);
        console.log('Block number:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed);

        // Get final balances
        const sourceBalance = await web3.eth.getBalance(sourceAddress);
        const destBalance = await web3.eth.getBalance(destinationAddress);

        console.log('\nFinal balances:');
        console.log('Source balance:', web3.utils.fromWei(sourceBalance, 'ether'), 'ETH');
        console.log('Destination balance:', web3.utils.fromWei(destBalance, 'ether'), 'ETH');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

transferETH(); 