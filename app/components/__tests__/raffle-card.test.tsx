import { render, screen } from "@testing-library/react"
import { RaffleCard } from "../raffle-card"
import { mockRaffle } from "../../lib/test-utils"

describe("RaffleCard Component", () => {
  test("renders raffle information correctly", () => {
    render(<RaffleCard raffle={mockRaffle} />)

    // Check if prizes are displayed
    expect(screen.getByText("iPhone 15 Pro")).toBeInTheDocument()
    expect(screen.getByText("MacBook Air")).toBeInTheDocument()
    expect(screen.getByText("AirPods Pro")).toBeInTheDocument()

    // Check entry fee
    expect(screen.getByText("0.01 ETH")).toBeInTheDocument()

    // Check participants
    expect(screen.getByText("25/100")).toBeInTheDocument()
  })

  test("shows correct payment token", () => {
    render(<RaffleCard raffle={mockRaffle} />)
    expect(screen.getByText("ETH")).toBeInTheDocument()
  })
})
