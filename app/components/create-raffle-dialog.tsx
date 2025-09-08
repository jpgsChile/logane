"use client"

import type React from "react"
import { useState } from "react"
import { PaymentToken, SUPPORTED_TOKENS } from "../../lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import type { CreateRaffleRequest, Prize } from "../../lib/types"
import { useWallet } from "../../hooks/use-wallet"

interface CreateRaffleDialogProps {
  onClose: () => void
  onSuccess: () => void
}

const CreateRaffleDialog: React.FC<CreateRaffleDialogProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [prizeCount, setPrizeCount] = useState(3)
  const [prizes, setPrizes] = useState<Prize[]>([
    { name: "", description: "", imageUrl: "", value: 0 },
    { name: "", description: "", imageUrl: "", value: 0 },
    { name: "", description: "", imageUrl: "", value: 0 }
  ])
  const [ticketPrice, setTicketPrice] = useState(0)
  const [maxParticipants, setMaxParticipants] = useState("")
  const [duration, setDuration] = useState("")
  const [paymentToken, setPaymentToken] = useState<PaymentToken>(PaymentToken.ETH)
  const [isCreating, setIsCreating] = useState(false)

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

  // Debug logs
  console.log('CreateRaffleDialog - Wallet State:', {
    isHydrated,
    isConnected,
    walletAddress,
    isCorrectNetwork,
    hasBalance
  })

  const handlePrizeCountChange = (count: number) => {
    setPrizeCount(count)
    const newPrizes = Array.from({ length: count }, (_, i) => 
      prizes[i] || { name: "", description: "", imageUrl: "", value: 0 }
    )
    setPrizes(newPrizes)
  }

  const handlePrizeChange = (index: number, field: keyof Prize, value: string | number) => {
    const newPrizes = [...prizes]
    newPrizes[index] = { ...newPrizes[index], [field]: value }
    setPrizes(newPrizes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones de wallet
    if (!isConnected) {
      alert("Debes conectar tu wallet primero")
      return
    }

    if (!isCorrectNetwork) {
      alert("Debes estar conectado a BASE Sepolia testnet")
      return
    }

    if (!hasBalance) {
      alert("No tienes ETH suficiente. Usa el faucet para obtener ETH de testnet")
      return
    }
    
    // Validación básica
    if (!title.trim() || !description.trim()) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }
    
    if (prizeCount < 1 || prizeCount > 9) {
      alert("Debe haber entre 1 y 9 premios")
      return
    }

    // Validar que todos los premios tengan nombre (imagen puede ir vacía)
    const validPrizes = prizes.slice(0, prizeCount)
    if (validPrizes.some(prize => !prize.name.trim())) {
      alert("Todos los premios deben tener un nombre")
      return
    }
    
    if (Number.parseInt(maxParticipants) <= prizeCount) {
      alert("Debe haber al menos 1 participante más que premios")
      return
    }

    if (ticketPrice <= 0) {
      alert("El precio del ticket debe ser mayor a 0")
      return
    }

    if (Number.parseInt(duration) < 1) {
      alert("La duración debe ser al menos 1 día")
      return
    }

    setIsCreating(true)

    const raffleData: CreateRaffleRequest = {
      title,
      description,
      // Normalizamos los premios: si imageUrl está vacío, enviamos string vacío explícito
      prizes: prizes.slice(0, prizeCount).map((p) => ({
        name: p.name.trim(),
        description: p.description?.trim() || "",
        imageUrl: p.imageUrl?.trim() || "",
        value: p.value || 0,
      })),
      prizeCount,
      ticketPrice,
      maxParticipants: Number.parseInt(maxParticipants),
      duration: Number.parseInt(duration) * 24 * 60 * 60,
      paymentToken,
    }
    
    try {
      // Importar el servicio de blockchain dinámicamente para evitar problemas de SSR
      const { blockchainService } = await import("../../lib/blockchain")
      
      const result = await blockchainService.createRaffle({
        ...raffleData,
        creator: walletAddress || undefined
      })
      
      if (result.success) {
        alert(`¡Rifa creada exitosamente! ID: ${result.raffleId}`)
        onSuccess()
        onClose()
      } else {
        alert(`Error al crear la rifa: ${result.error}`)
      }
    } catch (error) {
      console.error("Error creating raffle:", error)
      alert("Error al crear la rifa. Intenta de nuevo.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Crear Nueva Rifa</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Estado de la wallet */}
        {!isHydrated ? (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-gray-600">⏳</div>
              <h3 className="font-medium text-gray-800">Inicializando...</h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Cargando información de wallet
            </p>
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          </div>
        ) : !isConnected ? (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-yellow-600">⚠️</div>
              <h3 className="font-medium text-yellow-800">Wallet no conectada</h3>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Necesitas conectar tu wallet para crear una rifa
            </p>
            <button
              type="button"
              onClick={connectWallet}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Conectar Wallet
            </button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-green-600">✅</div>
              <h3 className="font-medium text-green-800">Wallet Conectada</h3>
            </div>
            <p className="text-sm text-green-700 mb-2">
              {formatAddress(walletAddress!)} - BASE Sepolia
            </p>
            {!isCorrectNetwork && (
              <p className="text-sm text-yellow-700">
                ⚠️ Cambia a BASE Sepolia testnet
              </p>
            )}
            {isCorrectNetwork && !hasBalance && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-blue-700">
                  💧 Obtén ETH de testnet
                </p>
                <button
                  type="button"
                  onClick={getFaucetETH}
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Usar Faucet
                </button>
              </div>
            )}
            {isCorrectNetwork && hasBalance && (
              <p className="text-sm text-green-700">
                🎉 ¡Listo para crear rifas!
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título y Descripción */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título de la Rifa</Label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Ej: Rifa iPhone 15 Pro"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md h-20"
            placeholder="Describe tu rifa..."
            required
          />
        </div>
      </div>

      {/* Número de Premios */}
      <div className="space-y-2">
        <Label htmlFor="prizeCount">Número de Premios (1-9)</Label>
        <Select
          value={prizeCount.toString()}
          onValueChange={(value: string) => handlePrizeCountChange(Number.parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona número de premios" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} premio{num > 1 ? 's' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Premios Dinámicos */}
      <div className="space-y-4">
        <Label>Premios</Label>
        {prizes.slice(0, prizeCount).map((prize, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium">Premio {index + 1}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`prize-name-${index}`}>Nombre</Label>
                <input
                  id={`prize-name-${index}`}
                  type="text"
                  value={prize.name}
                  onChange={(e) => handlePrizeChange(index, 'name', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Ej: iPhone 15 Pro"
                />
              </div>
              <div>
                <Label htmlFor={`prize-value-${index}`}>Valor (ETH)</Label>
                <input
                  id={`prize-value-${index}`}
                  type="number"
                  step="0.001"
                  value={prize.value}
                  onChange={(e) => handlePrizeChange(index, 'value', Number.parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded-md"
                  placeholder="0.1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor={`prize-description-${index}`}>Descripción</Label>
              <textarea
                id={`prize-description-${index}`}
                value={prize.description}
                onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Describe el premio..."
              />
            </div>
            <div>
              <Label htmlFor={`prize-image-${index}`}>URL de Imagen</Label>
              <input
                id={`prize-image-${index}`}
                type="url"
                value={prize.imageUrl}
                onChange={(e) => handlePrizeChange(index, 'imageUrl', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Configuración de la Rifa */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticketPrice">Precio por Ticket (ETH)</Label>
          <input
            id="ticketPrice"
            type="number"
            step="0.001"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(Number.parseFloat(e.target.value) || 0)}
            className="w-full p-2 border rounded-md"
            placeholder="0.01"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Máximo Participantes</Label>
          <input
            id="maxParticipants"
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="100"
            min={prizeCount + 1}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duración (días)</Label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="7"
            min="1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentToken">Token de Pago</Label>
          <Select
            value={paymentToken.toString()}
            onValueChange={(value: string) => setPaymentToken(Number.parseInt(value) as PaymentToken)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el token de pago" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUPPORTED_TOKENS).map(([key, token]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{token.icon}</span>
                    <span>
                      {token.symbol} - {token.name}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating || !isHydrated || !isConnected || !isCorrectNetwork || !hasBalance}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                isCreating || !isHydrated || !isConnected || !isCorrectNetwork || !hasBalance
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              }`}
            >
              {isCreating ? 'Creando Rifa...' : 'Crear Rifa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRaffleDialog
