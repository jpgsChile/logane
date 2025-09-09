/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://v0-rifa-pps-mini-app-development.vercel.app',
    NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org',
    NEXT_PUBLIC_BASE_MAINNET_RPC_URL: process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org',
    NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS_SEPOLIA: process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS_SEPOLIA || process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS || '',
    NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS_MAINNET: process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS_MAINNET || '',
  },
}

module.exports = nextConfig
