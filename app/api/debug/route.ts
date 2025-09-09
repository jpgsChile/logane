import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    environment: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS,
      NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
      NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    },
    network: {
      baseSepolia: {
        chainId: 84532,
        rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org",
        contractAddress: process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS || "0x6c593Ca0081b80e2bb447E080C0b8Cff4c76F8F4",
        explorer: "https://sepolia.basescan.org"
      }
    },
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(config, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
