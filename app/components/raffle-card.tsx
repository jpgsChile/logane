"use client"

import type React from "react"
import { useState } from "react"
import { SUPPORTED_TOKENS, PaymentToken } from "../../lib/types"
import type { Raffle } from "../../lib/types"
import { useWallet } from "../../hooks/use-wallet"
import ParticipateDialog from "./participate-dialog"

interface RaffleCardProps {
  raffle: Raffle
  onParticipate?: () => void
}

const RaffleCard: React.FC<RaffleCardProps> = ({ raffle, onParticipate }) => {
  const [showParticipateDialog, setShowParticipateDialog] = useState(false)
  const { isConnected, isCorrectNetwork, hasBalance, isHydrated } = useWallet()

  const formatTicketPrice = (priceWei: number, token: PaymentToken) => {
    const decimals = SUPPORTED_TOKENS[token].decimals
    const price = Number(priceWei) / Math.pow(10, decimals)
    if (price < 0.001) {
      return `${(price * 1000).toFixed(2)}m ${SUPPORTED_TOKENS[token].symbol}`
    }
    return `${price.toFixed(3)} ${SUPPORTED_TOKENS[token].symbol}`
  }

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = endTime - now
    
    if (remaining <= 0) return "Finalizada"
    
    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const canParticipate = isHydrated && isConnected && isCorrectNetwork && hasBalance

  const handleParticipate = () => {
    if (!isHydrated) {
      return
    }
    if (!canParticipate) {
      alert("Debes conectar tu wallet y tener ETH para participar")
      return
    }
    setShowParticipateDialog(true)
  }

  const handleParticipateSuccess = () => {
    setShowParticipateDialog(false)
    if (onParticipate) {
      onParticipate()
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
        {/* Header con imagen del premio principal */}
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
          {raffle.prizes[0]?.imageUrl ? (
            <img
              src={raffle.prizes[0].imageUrl}
              alt={raffle.prizes[0].name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-6xl">🎁</div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
              {raffle.participants.length}/{raffle.maxParticipants}
            </span>
          </div>
        </div>

        {/* Contenido de la tarjeta */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {raffle.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {raffle.description}
            </p>
          </div>

          {/* Premios */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Premios ({raffle.prizes.length})
            </h4>
            <div className="space-y-1">
              {raffle.prizes.slice(0, 3).map((prize, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">🏆</span>
                  <span className="text-gray-700 truncate">{prize.name}</span>
                  {prize.value > 0 && (
                    <span className="text-gray-500 text-xs">
                      ({prize.value} ETH)
                    </span>
                  )}
                </div>
              ))}
              {raffle.prizes.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{raffle.prizes.length - 3} premio{raffle.prizes.length - 3 > 1 ? 's' : ''} más
                </div>
              )}
            </div>
          </div>

          {/* Precio del ticket */}
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Precio del ticket:</span>
              <div className="flex items-center gap-2">
                <span className="text-xl">{SUPPORTED_TOKENS[raffle.paymentToken].icon}</span>
                <span className="font-bold text-lg text-gray-900">
                  {formatTicketPrice(raffle.ticketPrice, raffle.paymentToken)}
                </span>
              </div>
            </div>
          </div>

          {/* Tiempo restante */}
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">Tiempo restante:</span>
            <span className={`font-medium ${
              raffle.endTime <= Math.floor(Date.now() / 1000) 
                ? 'text-red-600' 
                : 'text-green-600'
            }`}>
              {formatTimeRemaining(raffle.endTime)}
            </span>
          </div>

          {/* Botón de participación */}
          <button
            onClick={handleParticipate}
            disabled={!canParticipate || raffle.participants.length >= raffle.maxParticipants || raffle.endTime <= Math.floor(Date.now() / 1000)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              !canParticipate || raffle.participants.length >= raffle.maxParticipants || raffle.endTime <= Math.floor(Date.now() / 1000)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:shadow-lg'
            }`}
          >
            {!isHydrated
              ? 'Cargando...'
              : !isConnected 
              ? 'Conecta tu wallet'
              : !isCorrectNetwork
              ? 'Cambia a BASE Sepolia'
              : !hasBalance
              ? 'Obtén ETH de testnet'
              : raffle.participants.length >= raffle.maxParticipants
              ? 'Rifa llena'
              : raffle.endTime <= Math.floor(Date.now() / 1000)
              ? 'Finalizada'
              : 'Participar en la Rifa'
            }
          </button>
        </div>
      </div>

      {/* Diálogo de participación */}
      {showParticipateDialog && (
        <ParticipateDialog
          raffle={raffle}
          onClose={() => setShowParticipateDialog(false)}
          onSuccess={handleParticipateSuccess}
        />
      )}
    </>
  )
}

export default RaffleCard
