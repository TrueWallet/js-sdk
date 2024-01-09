export const BalanceOfAbi = [{
  "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
  "name": "balanceOf",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}];

export const DecimalsAbi = [{
  "inputs": [],
  "name": "decimals",
  "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
  "stateMutability": "view",
  "type": "function"
}];

export const TransferAbi = [{
  "inputs": [{"internalType": "address", "name": "recipient", "type": "address"}, {
    "internalType": "uint256",
    "name": "amount",
    "type": "uint256"
  }],
  "name": "transfer",
  "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
  "stateMutability": "nonpayable",
  "type": "function"
}];
