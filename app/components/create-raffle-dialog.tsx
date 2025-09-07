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
  const [prize1, setPrize1] = useState<Prize>({ name: "", amount: 0 })
  const [prize2, setPrize2] = useState<Prize>({ name: "", amount: 0 })
  const [prize3, setPrize3] = useState<Prize>({ name: "", amount: 0 })
  const [ticketPrice, setTicketPrice] = useState(0)
  const [maxParticipants, setMaxParticipants] = useState("")
  const [duration, setDuration] = useState("")
  const [paymentToken, setPaymentToken] = useState<PaymentToken>(PaymentToken.ETH)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // ... existing validation code ...

    const raffleData: CreateRaffleRequest = {
      title,
      description,
      prizes: [prize1, prize2, prize3] as [Prize, Prize, Prize],
      ticketPrice,
      maxParticipants: Number.parseInt(maxParticipants),
      duration: Number.parseInt(duration) * 24 * 60 * 60,
      paymentToken, // Include selected payment token
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... existing form fields ... */}

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

      {/* ... existing form fields ... */}
    </form>
  )
}

export default CreateRaffleDialog
