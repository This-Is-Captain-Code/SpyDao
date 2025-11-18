import dotenv from "dotenv";
import "@nomicfoundation/hardhat-ethers"; // 👈 IMPORTANT: load ethers plugin

dotenv.config();

const { RAYLS_RPC, PRIVATE_KEY } = process.env;

/** @type import("hardhat/config").HardhatUserConfig */
const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.8.24",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.8.25",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
  networks: {
    rayls: {
      type: "http",
      url: RAYLS_RPC ?? "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

export default config;
