require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  networks: {
    zerog: {
      type: 'http',
      url: 'https://evmrpc-testnet.0g.ai',
      chainId: 16602,
      chainType: 'l1',
      accounts: [process.env.ZG_PRIVATE_KEY],
    },
    zgMainnet: {
      type: 'http',
      url: 'https://evmrpc.0g.ai',
      chainId: 16661,
      chainType: 'l1',
      accounts: [process.env.ZG_PRIVATE_KEY],
    },
  },
};
