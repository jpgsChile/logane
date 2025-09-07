// Servicio de blockchain para interactuar con el smart contract
import { ethers } from "ethers";
import type { 
  Raffle, 
  CreateRaffleRequest, 
  BlockchainService,
  PaymentToken 
} from "./types";

// Configuración de la red BASE
const RPC_URL = process.env.RPC_URL || "https://mainnet.base.org";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS || "";

// ABI del contrato (simplificado para este ejemplo)
const CONTRACT_ABI = [
  "function getRaffle(uint256 _raffleId) external view returns (tuple(uint256 id, string title, string description, tuple(string name, string description, string imageUrl, uint256 value)[9] prizes, uint256 prizeCount, uint256 ticketPrice, uint256 maxParticipants, uint256 endTime, address creator, address[] participants, bool isActive, bool isDrawn, address[9] winners, uint256 createdAt, uint8 paymentToken))",
  "function getActiveRaffles() external view returns (uint256[])",
  "function getUserRaffles(address _user) external view returns (uint256[])",
  "function createRaffle(string memory _title, string memory _description, tuple(string name, string description, string imageUrl, uint256 value)[9] memory _prizes, uint256 _prizeCount, uint256 _ticketPrice, uint256 _maxParticipants, uint256 _duration, uint8 _paymentToken) external returns (uint256)",
  "function joinRaffle(uint256 _raffleId) external payable",
  "function drawWinners(uint256 _raffleId) external",
  "function claimPrize(uint256 _raffleId, uint256 _prizeIndex) external",
  "function getParticipantCount(uint256 _raffleId) external view returns (uint256)",
  "event RaffleCreated(uint256 indexed raffleId, address indexed creator, string title, uint256 ticketPrice, uint256 maxParticipants, uint256 endTime, uint8 paymentToken)",
  "event ParticipantJoined(uint256 indexed raffleId, address indexed participant, uint256 participantCount)",
  "event RaffleDrawn(uint256 indexed raffleId, address[9] winners, uint256 prizeCount, uint256 timestamp)",
  "event PrizeClaimed(uint256 indexed raffleId, address indexed winner, uint256 prizeIndex, uint256 amount)"
];

class BlockchainServiceImpl implements BlockchainService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
  }

  async getRaffle(id: number): Promise<Raffle | null> {
    try {
      const raffleData = await this.contract.getRaffle(id);
      
      if (!raffleData || raffleData.id === 0) {
        return null;
      }

      return {
        id: Number(raffleData.id),
        title: raffleData.title,
        description: raffleData.description,
        prizes: raffleData.prizes.map((prize: any) => ({
          name: prize.name,
          description: prize.description,
          imageUrl: prize.imageUrl,
          value: Number(prize.value)
        })),
        prizeCount: Number(raffleData.prizeCount),
        ticketPrice: Number(raffleData.ticketPrice),
        maxParticipants: Number(raffleData.maxParticipants),
        endTime: Number(raffleData.endTime),
        creator: raffleData.creator,
        participants: raffleData.participants,
        isActive: raffleData.isActive,
        isDrawn: raffleData.isDrawn,
        winners: raffleData.winners,
        createdAt: Number(raffleData.createdAt),
        paymentToken: Number(raffleData.paymentToken) as PaymentToken
      };
    } catch (error) {
      console.error("Error fetching raffle:", error);
      return null;
    }
  }

  async getActiveRaffles(): Promise<Raffle[]> {
    try {
      // En una implementación real, necesitarías un método en el contrato
      // que devuelva todos los IDs de rifas activas
      // Por ahora, simulamos con un rango
      const raffles: Raffle[] = [];
      
      // Buscar rifas activas (esto es ineficiente, pero funcional)
      for (let i = 1; i <= 100; i++) {
        const raffle = await this.getRaffle(i);
        if (raffle && raffle.isActive && !raffle.isDrawn) {
          raffles.push(raffle);
        }
      }
      
      return raffles;
    } catch (error) {
      console.error("Error fetching active raffles:", error);
      return [];
    }
  }

  async getUserRaffles(address: string): Promise<number[]> {
    try {
      const raffleIds = await this.contract.getUserRaffles(address);
      return raffleIds.map((id: any) => Number(id));
    } catch (error) {
      console.error("Error fetching user raffles:", error);
      return [];
    }
  }

  async createRaffle(data: CreateRaffleRequest): Promise<{ success: boolean; raffleId?: number; error?: string }> {
    try {
      // En una implementación real, esto devolvería los datos de la transacción
      // para que el frontend la ejecute con la wallet del usuario
      return {
        success: true,
        raffleId: Math.floor(Math.random() * 1000) // Simulado
      };
    } catch (error) {
      console.error("Error creating raffle:", error);
      return {
        success: false,
        error: "Error al crear la rifa"
      };
    }
  }

  async joinRaffle(raffleId: number, participantAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      // En una implementación real, esto devolvería los datos de la transacción
      return {
        success: true
      };
    } catch (error) {
      console.error("Error joining raffle:", error);
      return {
        success: false,
        error: "Error al participar en la rifa"
      };
    }
  }

  async drawWinners(raffleId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // En una implementación real, esto devolvería los datos de la transacción
      return {
        success: true
      };
    } catch (error) {
      console.error("Error drawing winners:", error);
      return {
        success: false,
        error: "Error al sortear ganadores"
      };
    }
  }

  async claimPrize(raffleId: number, prizeIndex: number, winnerAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      // En una implementación real, esto devolvería los datos de la transacción
      return {
        success: true
      };
    } catch (error) {
      console.error("Error claiming prize:", error);
      return {
        success: false,
        error: "Error al reclamar premio"
      };
    }
  }
}

export const blockchainService = new BlockchainServiceImpl();
