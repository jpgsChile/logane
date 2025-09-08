"use client"

import type React from "react"
import { useWallet } from "../../hooks/use-wallet"

interface WalletStatusProps {
  showBalance?: boolean
  showFaucet?: boolean
  className?: string
}

const WalletStatus: React.FC<WalletStatusProps> = ({ 
  showBalance = true, 
  showFaucet = true,
  className = ""
}) => {
  const {
    address: walletAddress,
    isConnected,
    isCorrectNetwork,
    hasBalance,
    balance,
    connectWallet,
    getFaucetETH,
    formatAddress
  } = useWallet()

  if (!isConnected) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-yellow-600">⚠️</div>
          <h3 className="font-medium text-yellow-800">Wallet no conectada</h3>
        </div>
        <p className="text-sm text-yellow-700 mb-3">
          Necesitas conectar tu wallet para continuar
        </p>
        <button
          onClick={connectWallet}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
        >
          Conectar Wallet
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Estado de conexión */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-green-600">✅</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
          <p className="text-xs text-green-600">{formatAddress(walletAddress!)}</p>
          {showBalance && balance && (
            <p className="text-xs text-green-600">Balance: {balance} ETH</p>
          )}
        </div>
      </div>

      {/* Estado de la red */}
      {!isCorrectNetwork && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-yellow-600">⚠️</div>
          <p className="text-sm text-yellow-700">Cambia a BASE Sepolia testnet</p>
        </div>
      )}

      {/* Estado del balance */}
      {isCorrectNetwork && !hasBalance && showFaucet && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-blue-600">💧</div>
          <div className="flex-1">
            <p className="text-sm text-blue-700">Obtén ETH de testnet</p>
            <button
              onClick={getFaucetETH}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              Usar Faucet
            </button>
          </div>
        </div>
      )}

      {/* Estado listo */}
      {isCorrectNetwork && hasBalance && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-600">🎉</div>
          <p className="text-sm text-green-700">¡Listo para usar!</p>
        </div>
      )}
    </div>
  )
}

export default WalletStatus
