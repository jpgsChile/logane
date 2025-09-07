import type React from "react"
import { PaymentToken, SUPPORTED_TOKENS } from "@/lib/types"
import type { Raffle } from "@/lib/types" //  Suponiendo que el tipo de Rifa se declara aquí o se importa desde otro archivo


interface ParticipateDialogProps {
  raffle: Raffle
}

const ParticipateDialog: React.FC<ParticipateDialogProps> = ({ raffle }) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Participar en Sorteo</h3>
        <p className="text-muted-foreground">{raffle.title}</p>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span>Precio del ticket:</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{SUPPORTED_TOKENS[raffle.paymentToken].icon}</span>
            <span className="font-bold">
              {raffle.ticketPrice} {SUPPORTED_TOKENS[raffle.paymentToken].symbol}
            </span>
          </div>
        </div>

        {raffle.paymentToken !== PaymentToken.ETH && (
          <p className="text-sm text-muted-foreground mt-2">
            Asegúrate de tener suficiente {SUPPORTED_TOKENS[raffle.paymentToken].symbol} en tu wallet y aprobar la
            transacción.
          </p>
        )}
      </div>

      {/* ... Form de ingreso al sorteo ... */}
    </div>
  )
}

export default ParticipateDialog
