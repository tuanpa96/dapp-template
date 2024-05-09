/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const { i18n } = require("./i18n.config");
const withTM = require("next-transpile-modules")([
  "@renec-foundation/wallet-adapter-react",
]);

const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    CYPRESS_E2E_WALLET_PRIVATE_KEY: process.env.CYPRESS_E2E_WALLET_PRIVATE_KEY,
    CYPRESS_TREASURY_PRIVATE_KEY: process.env.CYPRESS_TREASURY_PRIVATE_KEY,
  },
};

module.exports = withTM(nextConfig);
