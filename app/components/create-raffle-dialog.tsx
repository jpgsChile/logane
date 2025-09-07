"use client"

import type React from "react"
import { useState } from "react"
import { PaymentToken, SUPPORTED_TOKENS } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { CreateRaffleRequest, Prize } from "@/lib/types" // Declare CreateRaffleRequest and Prize

const CreateRaffleDialog: React.FC = () => {
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
    
    // Validación básica
    if (!title.trim() || !description.trim()) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }
    
    if (prizeCount < 1 || prizeCount > 9) {
      alert("Debe haber entre 1 y 9 premios")
      return
    }
    
    if (Number.parseInt(maxParticipants) <= prizeCount) {
      alert("Debe haber al menos 1 participante más que premios")
      return
    }

    const raffleData: CreateRaffleRequest = {
      title,
      description,
      prizes: prizes.slice(0, prizeCount),
      ticketPrice,
      maxParticipants: Number.parseInt(maxParticipants),
      duration: Number.parseInt(duration) * 24 * 60 * 60,
      paymentToken,
    }
    
    console.log("Datos de la rifa:", raffleData)
  }

  return (
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
          onValueChange={(value) => handlePrizeCountChange(Number.parseInt(value))}
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
            onValueChange={(value) => setPaymentToken(Number.parseInt(value) as PaymentToken)}
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

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Crear Rifa
      </button>
    </form>
  )
}

export default CreateRaffleDialog
