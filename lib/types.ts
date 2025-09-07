// Tipos para el sistema de rifas "Lo Gane"

export enum PaymentToken {
  ETH = 0,
  USDT = 1,
  USDC = 2,
}

export interface Prize {
  name: string;
  description: string;
  imageUrl: string;
  value: number; // Valor en wei o unidades de token
}

export interface Raffle {
  id: number;
  title: string;
  description: string;
  prizes: Prize[];
  prizeCount: number;
  ticketPrice: number;
  maxParticipants: number;
  endTime: number;
  creator: string;
  participants: string[];
  isActive: boolean;
  isDrawn: boolean;
  winners: string[];
  createdAt: number;
  paymentToken: PaymentToken;
}

export interface CreateRaffleRequest {
  title: string;
  description: string;
  prizes: Prize[];
  ticketPrice: number;
  maxParticipants: number;
  duration: number; // en segundos
  paymentToken: PaymentToken;
}

export interface RaffleResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ParticipateRequest {
  raffleId: number;
  participantAddress: string;
}

export const SUPPORTED_TOKENS = {
  [PaymentToken.ETH]: {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    decimals: 18,
  },
  [PaymentToken.USDT]: {
    symbol: "USDT",
    name: "Tether USD",
    icon: "₮",
    decimals: 6,
  },
  [PaymentToken.USDC]: {
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
    decimals: 6,
  },
};

export interface BlockchainService {
  getRaffle(id: number): Promise<Raffle | null>;
  getActiveRaffles(): Promise<Raffle[]>;
  getUserRaffles(address: string): Promise<number[]>;
  createRaffle(data: CreateRaffleRequest): Promise<{ success: boolean; raffleId?: number; error?: string }>;
  joinRaffle(raffleId: number, participantAddress: string): Promise<{ success: boolean; error?: string }>;
  drawWinners(raffleId: number): Promise<{ success: boolean; error?: string }>;
  claimPrize(raffleId: number, prizeIndex: number, winnerAddress: string): Promise<{ success: boolean; error?: string }>;
}
