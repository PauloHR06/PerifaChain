require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {}, // local
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY",
      accounts: ["0x" + process.env.PRIVATE_KEY]
    }
  }
};
