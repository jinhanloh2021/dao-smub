import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // sepolia: {
    //   url: process.env.SEPOLIA_RPC_URL || '',
    //   accounts: [process.env.SEPOLIA_PRIVATE_KEY || '0xkey'],
    //   chainId: 11155111,
    // },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
  },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY || 'Key',
  // },
  mocha: {
    timeout: 300000,
  },
};

export default config;
