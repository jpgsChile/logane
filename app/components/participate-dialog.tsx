"use client"

import type React from "react"
import { useState } from "react"
import { PaymentToken, SUPPORTED_TOKENS } from "../../lib/types"
import type { Raffle } from "../../lib/types"
import { useWallet } from "../../hooks/use-wallet"
import { blockchainService } from "../../lib/blockchain"

interface ParticipateDialogProps {
  raffle: Raffle
  onClose: () => void
  onSuccess: () => void
}

const ParticipateDialog: React.FC<ParticipateDialogProps> = ({ raffle, onClose, onSuccess }) => {
  const [isParticipating, setIsParticipating] = useState(false)
  const [error, setError] = useState("")
  const {
    address: walletAddress,
    isConnected,
    isCorrectNetwork,
    hasBalance,
    connectWallet,
    getFaucetETH,
    formatAddress,
    isHydrated
  } = useWallet()

  const handleParticipate = async () => {
    if (!isConnected) {
      setError("Debes conectar tu wallet primero")
      return
    }

    if (!isCorrectNetwork) {
      setError("Debes estar conectado a BASE Sepolia testnet")
      return
    }

    if (!hasBalance) {
      setError("No tienes ETH suficiente. Usa el faucet para obtener ETH de testnet")
      return
    }

    setIsParticipating(true)
    setError("")

    try {
      const result = await blockchainService.joinRaffle(raffle.id, walletAddress!)
      
      if (result.success) {
        alert("¡Te has unido a la rifa exitosamente!")
        onSuccess()
        onClose()
      } else {
        setError(result.error || "Error al participar en la rifa")
      }
    } catch (error) {
      console.error("Error participating in raffle:", error)
      setError("Error al participar en la rifa")
    } finally {
      setIsParticipating(false)
    }
  }

  const handleGetFaucet = async () => {
    await getFaucetETH()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Participar en Rifa</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">{raffle.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{raffle.description}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Precio del ticket:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{SUPPORTED_TOKENS[raffle.paymentToken].icon}</span>
                <span className="font-bold text-lg">
                  {(Number(raffle.ticketPrice) / Math.pow(10, SUPPORTED_TOKENS[raffle.paymentToken].decimals)).toFixed(4)} {SUPPORTED_TOKENS[raffle.paymentToken].symbol}
                </span>
              </div>
            </div>

            {raffle.paymentToken !== PaymentToken.ETH && (
              <p className="text-sm text-gray-600 mt-2">
                Asegúrate de tener suficiente {SUPPORTED_TOKENS[raffle.paymentToken].symbol} en tu wallet y aprobar la
                transacción.
              </p>
            )}
          </div>

          {/* Estado de la wallet */}
          {!isHydrated ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">⏳</div>
              <p className="text-sm text-gray-600">Inicializando wallet...</p>
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          ) : !isConnected ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">🔗</div>
              <p className="text-sm text-gray-600">Conecta tu wallet para participar</p>
              <button
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Conectar Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-600">✅</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
                  <p className="text-xs text-green-600">{formatAddress(walletAddress!)}</p>
                </div>
              </div>

              {!isCorrectNetwork && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-yellow-600">⚠️</div>
                  <p className="text-sm text-yellow-700">Cambia a BASE Sepolia testnet</p>
                </div>
              )}

              {isCorrectNetwork && !hasBalance && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-blue-600">💧</div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-700">Obtén ETH de testnet</p>
                    <button
                      onClick={handleGetFaucet}
                      className="text-xs text-blue-600 underline hover:text-blue-800"
                    >
                      Usar Faucet
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-600">⚠️</div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {isCorrectNetwork && hasBalance && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-green-600">🎉</div>
                    <p className="text-sm text-green-700">¡Listo para participar!</p>
                  </div>

                  <button
                    onClick={handleParticipate}
                    disabled={isParticipating}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {isParticipating ? "Participando..." : "Participar en la Rifa"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParticipateDialog
