require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const ALCHEMY_URL = process.env.ALCHEMY_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      chainId: 5,
      url: ALCHEMY_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
