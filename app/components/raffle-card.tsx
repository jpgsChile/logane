import type React from "react"
import { SUPPORTED_TOKENS } from "@/lib/types"

interface RaffleCardProps {
  raffle: {
    paymentToken: string
    ticketPrice: number
  }
}

const RaffleCard: React.FC<RaffleCardProps> = ({ raffle }) => {
  return (
    <div className="raffle-card">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Ticket de participación:</span>
        <div className="flex items-center gap-1">
          <span>{SUPPORTED_TOKENS[raffle.paymentToken].icon}</span>
          <span>
            {raffle.ticketPrice} {SUPPORTED_TOKENS[raffle.paymentToken].symbol}
          </span>
        </div>
      </div>

      {/* rest of code here */}
    </div>
  )
}

export default RaffleCard
