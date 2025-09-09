// Servicio de blockchain para interactuar con el smart contract
import { ethers } from "ethers";
import type { 
  Raffle, 
  CreateRaffleRequest, 
  BlockchainService,
  PaymentToken 
} from "./types";
import { SUPPORTED_TOKENS } from "./types";

// Configuración de redes BASE (Testnet/Mainnet)
const RPC_URL_SEPOLIA =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://sepolia.base.org";
const RPC_URL_MAINNET =
  process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL ||
  "https://mainnet.base.org";

const CONTRACT_ADDRESS_SEPOLIA =
  process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS_SEPOLIA ||
  process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS ||
  "";
const CONTRACT_ADDRESS_MAINNET =
  process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS_MAINNET ||
  "";

// ABI del contrato (completo)
const CONTRACT_ABI = [
  // Eventos
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "raffleId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "ticketPrice", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "maxParticipants", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "indexed": false, "internalType": "enum RaffleContract.PaymentToken", "name": "paymentToken", "type": "uint8" }
    ],
    "name": "RaffleCreated",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "address", "name": "_feeRecipient", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_raffleId", "type": "uint256"}],
    "name": "getRaffle",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "id", "type": "uint256"},
        {"internalType": "string", "name": "title", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {
          "components": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "string", "name": "imageUrl", "type": "string"},
            {"internalType": "uint256", "name": "value", "type": "uint256"}
          ],
          "internalType": "struct RaffleContract.Prize[9]",
          "name": "prizes",
          "type": "tuple[9]"
        },
        {"internalType": "uint256", "name": "prizeCount", "type": "uint256"},
        {"internalType": "uint256", "name": "ticketPrice", "type": "uint256"},
        {"internalType": "uint256", "name": "maxParticipants", "type": "uint256"},
        {"internalType": "uint256", "name": "endTime", "type": "uint256"},
        {"internalType": "address", "name": "creator", "type": "address"},
        {"internalType": "address[]", "name": "participants", "type": "address[]"},
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "bool", "name": "isDrawn", "type": "bool"},
        {"internalType": "address[9]", "name": "winners", "type": "address[9]"},
        {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
        {"internalType": "enum RaffleContract.PaymentToken", "name": "paymentToken", "type": "uint8"}
      ],
      "internalType": "struct RaffleContract.Raffle",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextRaffleId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserRaffles",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "imageUrl", "type": "string"},
          {"internalType": "uint256", "name": "value", "type": "uint256"}
        ],
        "internalType": "struct RaffleContract.Prize[9]",
        "name": "_prizes",
        "type": "tuple[9]"
      },
      {"internalType": "uint256", "name": "_prizeCount", "type": "uint256"},
      {"internalType": "uint256", "name": "_ticketPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "_maxParticipants", "type": "uint256"},
      {"internalType": "uint256", "name": "_duration", "type": "uint256"},
      {"internalType": "enum RaffleContract.PaymentToken", "name": "_paymentToken", "type": "uint8"}
    ],
    "name": "createRaffle",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_raffleId", "type": "uint256"}],
    "name": "joinRaffle",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_raffleId", "type": "uint256"}],
    "name": "drawWinners",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_raffleId", "type": "uint256"},
      {"internalType": "uint256", "name": "_prizeIndex", "type": "uint256"}
    ],
    "name": "claimPrize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_raffleId", "type": "uint256"}],
    "name": "getParticipantCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

class BlockchainServiceImpl implements BlockchainService {
  private provider: ethers.Provider | null = null; // default lectura
  private contract: ethers.Contract | null = null; // default lectura
  private isContractDeployed: boolean = false;
  // cache local en modo simulación
  private localRaffles: Raffle[] = [];

  constructor() {
    // Inicializar proveedor/contrato de lectura por defecto (testnet)
    try {
      if (CONTRACT_ADDRESS_SEPOLIA) {
        this.provider = new ethers.JsonRpcProvider(RPC_URL_SEPOLIA);
        this.contract = new ethers.Contract(CONTRACT_ADDRESS_SEPOLIA, CONTRACT_ABI, this.provider);
      } else if (CONTRACT_ADDRESS_MAINNET) {
        // Si no hay testnet pero sí mainnet, usar mainnet por defecto
        this.provider = new ethers.JsonRpcProvider(RPC_URL_MAINNET);
        this.contract = new ethers.Contract(CONTRACT_ADDRESS_MAINNET, CONTRACT_ABI, this.provider);
      }
      this.isContractDeployed = Boolean(CONTRACT_ADDRESS_SEPOLIA || CONTRACT_ADDRESS_MAINNET);
    } catch (error) {
      console.warn("Error initializing blockchain service:", error);
      this.isContractDeployed = false;
    }
  }

  private getBrowserProvider(): ethers.BrowserProvider | null {
    if (typeof window === "undefined") return null;
    const eth = (window as any).ethereum;
    if (!eth) return null;
    return new ethers.BrowserProvider(eth);
  }

  private async getSignerAndAddress(): Promise<{ signer: ethers.Signer; address: string | null; chainId: number } | null> {
    const browserProvider = this.getBrowserProvider();
    if (!browserProvider) return null;
    const signer = await browserProvider.getSigner();
    const addr = await signer.getAddress().catch(() => null);
    const network = await browserProvider.getNetwork();
    const chainId = Number(network.chainId);
    return { signer, address: addr, chainId };
  }

  private getAddressesAndRpcByChainId(chainId: number): { address: string; rpcUrl: string } | null {
    if (chainId === 8453) {
      // Base Mainnet
      if (!CONTRACT_ADDRESS_MAINNET) return null;
      return { address: CONTRACT_ADDRESS_MAINNET, rpcUrl: RPC_URL_MAINNET };
    }
    // Default: Base Sepolia
    if (!CONTRACT_ADDRESS_SEPOLIA) return null;
    return { address: CONTRACT_ADDRESS_SEPOLIA, rpcUrl: RPC_URL_SEPOLIA };
  }

  private async getReadContractDynamic(): Promise<ethers.Contract | null> {
    try {
      // Si hay provider de navegador, usar su red actual
      const browserProvider = this.getBrowserProvider();
      if (browserProvider) {
        const network = await browserProvider.getNetwork();
        const { address, rpcUrl } = this.getAddressesAndRpcByChainId(Number(network.chainId)) || {} as any;
        if (address && rpcUrl) {
          const prov = new ethers.JsonRpcProvider(rpcUrl);
          return new ethers.Contract(address, CONTRACT_ABI, prov);
        }
      }
    } catch {}
    // Fallback al contrato por defecto si existe
    return this.contract;
  }

  async getRaffle(id: number): Promise<Raffle | null> {
    if (this.isContractDeployed && this.contract) {
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
        console.error("Error fetching raffle from contract:", error);
        return null;
      }
    }

    // Datos simulados para desarrollo
    return this.getMockRaffle(id);
  }

  private getMockRaffle(id: number): Raffle | null {
    const mockRaffles: { [key: number]: Raffle } = {
      1: {
        id: 1,
        title: "Rifa iPhone 15 Pro",
        description: "Gana el último iPhone 15 Pro",
        prizeCount: 3,
        ticketPrice: ethers.parseEther("0.01"),
        maxParticipants: 100,
        endTime: Math.floor(Date.now() / 1000) + 86400, // 24 horas
        creator: "0x1234567890123456789012345678901234567890",
        participants: Array(45).fill(0).map((_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}`),
        isActive: true,
        isDrawn: false,
        winners: Array(9).fill("0x0000000000000000000000000000000000000000"),
        createdAt: Math.floor(Date.now() / 1000) - 3600,
        paymentToken: PaymentToken.ETH,
        prizes: [
          { name: "iPhone 15 Pro", description: "Último modelo", imageUrl: "", value: ethers.parseEther("0.5") },
          { name: "AirPods Pro", description: "Auriculares inalámbricos", imageUrl: "", value: ethers.parseEther("0.2") },
          { name: "Gift Card $100", description: "Tarjeta de regalo", imageUrl: "", value: ethers.parseEther("0.1") }
        ]
      },
      2: {
        id: 2,
        title: "Rifa Gaming Setup",
        description: "Setup completo para gaming",
        prizeCount: 2,
        ticketPrice: ethers.parseEther("0.02"),
        maxParticipants: 50,
        endTime: Math.floor(Date.now() / 1000) + 172800, // 48 horas
        creator: "0x0987654321098765432109876543210987654321",
        participants: Array(23).fill(0).map((_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}`),
        isActive: true,
        isDrawn: false,
        winners: Array(9).fill("0x0000000000000000000000000000000000000000"),
        createdAt: Math.floor(Date.now() / 1000) - 7200,
        paymentToken: PaymentToken.ETH,
        prizes: [
          { name: "PC Gaming", description: "PC de alta gama", imageUrl: "", value: ethers.parseEther("1.0") },
          { name: "Monitor 4K", description: "Monitor 4K 27 pulgadas", imageUrl: "", value: ethers.parseEther("0.3") }
        ]
      }
    };

    return mockRaffles[id] || null;
  }

  async getActiveRaffles(): Promise<Raffle[]> {
    if (this.isContractDeployed && this.contract) {
      try {
        // Consultar tope usando nextRaffleId para limitar el rango
        const nextId: bigint = await (this.contract as any).nextRaffleId();
        const maxId = Number(nextId) - 1;
        const results: Raffle[] = [];
        for (let i = 1; i <= Math.max(0, maxId); i++) {
          const raffle = await this.getRaffle(i);
          if (raffle && raffle.isActive && !raffle.isDrawn) {
            results.push(raffle);
          }
        }
        return results;
      } catch (error) {
        console.error("Error fetching active raffles from contract:", error);
        return [];
      }
    }

    // Datos simulados para desarrollo
    const seeded = [this.getMockRaffle(1)!, this.getMockRaffle(2)!].filter(Boolean) as Raffle[]
    const all = [...seeded, ...this.localRaffles]
    return all.filter(r => r.isActive && !r.isDrawn)
  }

  async getUserRaffles(address: string): Promise<Raffle[]> {
    if (this.isContractDeployed && this.contract) {
      try {
        const raffleIds = await this.contract.getUserRaffles(address);
        const raffles: Raffle[] = [];
        
        // Obtener los datos completos de cada rifa
        for (const id of raffleIds) {
          const raffle = await this.getRaffle(Number(id));
          if (raffle) {
            raffles.push(raffle);
          }
        }
        
        return raffles;
      } catch (error) {
        console.error("Error fetching user raffles from contract:", error);
        return [];
      }
    }

    // Datos simulados para desarrollo
    const seeded = [this.getMockRaffle(1), this.getMockRaffle(2)].filter(Boolean) as Raffle[]
    const all = [...seeded, ...this.localRaffles]
    return all.filter(r => r.creator.toLowerCase() === address.toLowerCase())
  }

  async createRaffle(data: CreateRaffleRequest): Promise<{ success: boolean; raffleId?: number; error?: string }> {
    if (this.isContractDeployed && this.contract) {
      try {
        // Asegurar longitud de premios exactamente 9 para el ABI
        const normalizedPrizes = Array.from({ length: 9 }, (_, i) => {
          const p = (data.prizes as any[])[i] || { name: "", description: "", imageUrl: "", value: 0 }
          return {
            name: p.name || "",
            description: p.description || "",
            imageUrl: p.imageUrl || "",
            // Convertir según el token de pago (ETH=18, USDC/USDT=6 decimales)
            value: ethers.parseUnits(String(p.value || 0), SUPPORTED_TOKENS[data.paymentToken].decimals)
          }
        })

        const prizeCount = (data as any).prizeCount ?? Math.min(data.prizes.length, 9)
        
        // Convertir precio según el token (ETH=18 decimales, USDC/USDT=6 decimales)
        const decimals = SUPPORTED_TOKENS[data.paymentToken].decimals
        const ticketPriceWei = ethers.parseUnits(String(data.ticketPrice), decimals)

        // Firmar y enviar transacción desde el navegador
        const browserProvider = this.getBrowserProvider()
        if (!browserProvider) {
          return { success: false, error: "Provider de navegador no disponible" }
        }
        const { signer, chainId } = (await this.getSignerAndAddress()) || {}
        if (!signer || !chainId) return { success: false, error: "No hay signer disponible" }
        const addrInfo = this.getAddressesAndRpcByChainId(chainId)
        if (!addrInfo) return { success: false, error: "Contrato no configurado para esta red" }
        const contractWithSigner = new ethers.Contract(addrInfo.address, CONTRACT_ABI, signer)

        const tx = await contractWithSigner.createRaffle(
          data.title,
          data.description,
          normalizedPrizes,
          prizeCount,
          ticketPriceWei,
          data.maxParticipants,
          data.duration,
          data.paymentToken
        )

        const receipt = await tx.wait()

        // Intentar extraer raffleId del evento RaffleCreated
        let createdId: number | undefined
        try {
          const eventTopic = ethers.id("RaffleCreated(uint256,address,string,uint256,uint256,uint256,uint8)")
          const log = receipt?.logs?.find((l: any) => l?.topics?.[0] === eventTopic)
          if (log) {
            const parsed = (contractWithSigner.interface as any).parseLog(log)
            if (parsed?.args?.raffleId) {
              createdId = Number(parsed.args.raffleId)
            }
          }
        } catch {}

        if (createdId === undefined) {
          try {
            const readContract = await this.getReadContractDynamic()
            const nextId: bigint = await (readContract as any).nextRaffleId()
            createdId = Number(nextId) - 1
          } catch {}
        }

        return { success: true, raffleId: createdId }
      } catch (error) {
        console.error("Error creating raffle:", error);
        return {
          success: false,
          error: "Error al crear la rifa"
        };
      }
    }

    // Simulación para desarrollo
    const newId = (this.localRaffles.at(-1)?.id ?? 200) + 1
    const now = Math.floor(Date.now() / 1000)
    const endTime = now + (data.duration || 0)
    const prizeCount = (data as any).prizeCount ?? Math.min(data.prizes.length, 9)
    const raffle: Raffle = {
      id: newId,
      title: data.title,
      description: data.description,
      prizes: data.prizes.slice(0, prizeCount).map(p => ({
        name: p.name,
        description: p.description || "",
        imageUrl: p.imageUrl || "",
        value: Number(ethers.parseUnits(String(p.value || 0), SUPPORTED_TOKENS[data.paymentToken].decimals))
      })).concat(Array.from({ length: Math.max(0, 9 - prizeCount) }, () => ({ name: "", description: "", imageUrl: "", value: 0 }))).slice(0, 9),
      prizeCount,
      ticketPrice: Number(ethers.parseUnits(String(data.ticketPrice), SUPPORTED_TOKENS[data.paymentToken].decimals)),
      maxParticipants: Number(data.maxParticipants),
      endTime,
      creator: data.creator || "0x0000000000000000000000000000000000000000",
      participants: [],
      isActive: true,
      isDrawn: false,
      winners: Array(9).fill("0x0000000000000000000000000000000000000000"),
      createdAt: now,
      paymentToken: data.paymentToken
    }
    this.localRaffles.push(raffle)
    return { success: true, raffleId: newId }
  }

  async joinRaffle(raffleId: number, participantAddress: string): Promise<{ success: boolean; error?: string }> {
    if (this.isContractDeployed && this.contract) {
      try {
        const browserProvider = this.getBrowserProvider()
        if (!browserProvider) {
          return { success: false, error: "Provider de navegador no disponible" }
        }
        const { signer, chainId } = (await this.getSignerAndAddress()) || {}
        if (!signer || !chainId) return { success: false, error: "No hay signer disponible" }
        const addrInfo = this.getAddressesAndRpcByChainId(chainId)
        if (!addrInfo) return { success: false, error: "Contrato no configurado para esta red" }
        const contractWithSigner = new ethers.Contract(addrInfo.address, CONTRACT_ABI, signer)

        // Obtener datos de la rifa para determinar el valor a enviar si es ETH
        const readContract = await this.getReadContractDynamic()
        const raffleData = await (readContract as any).getRaffle(raffleId)
        const paymentToken: number = Number(raffleData.paymentToken)
        const ticketPrice: bigint = BigInt(raffleData.ticketPrice)

        const overrides = paymentToken === PaymentToken.ETH ? { value: ticketPrice } : {}
        const tx = await (contractWithSigner as any).joinRaffle(raffleId, overrides)
        await tx.wait()
        return { success: true }
      } catch (error) {
        console.error("Error joining raffle:", error);
        return {
          success: false,
          error: "Error al participar en la rifa"
        };
      }
    }

    // Simulación para desarrollo
    return {
      success: true
    };
  }

  async drawWinners(raffleId: number): Promise<{ success: boolean; error?: string }> {
    if (this.isContractDeployed && this.contract) {
      try {
        const browserProvider = this.getBrowserProvider()
        if (!browserProvider) {
          return { success: false, error: "Provider de navegador no disponible" }
        }
        const { signer, chainId } = (await this.getSignerAndAddress()) || {}
        if (!signer || !chainId) return { success: false, error: "No hay signer disponible" }
        const addrInfo = this.getAddressesAndRpcByChainId(chainId)
        if (!addrInfo) return { success: false, error: "Contrato no configurado para esta red" }
        const contractWithSigner = new ethers.Contract(addrInfo.address, CONTRACT_ABI, signer)
        const tx = await (contractWithSigner as any).drawWinners(raffleId)
        await tx.wait()
        return { success: true }
      } catch (error) {
        console.error("Error drawing winners:", error);
        return {
          success: false,
          error: "Error al sortear ganadores"
        };
      }
    }

    // Simulación para desarrollo
    return {
      success: true
    };
  }

  async hasUserParticipated(raffleId: number, userAddress: string): Promise<boolean> {
    if (this.isContractDeployed && this.contract) {
      try {
        const hasParticipated = await (this.contract as any).hasParticipated(raffleId, userAddress);
        return Boolean(hasParticipated);
      } catch (error) {
        console.error("Error checking participation:", error);
        return false;
      }
    }
    
    // Simulación para desarrollo
    return false;
  }

  async claimPrize(raffleId: number, prizeIndex: number, winnerAddress: string): Promise<{ success: boolean; error?: string }> {
    if (this.isContractDeployed && this.contract) {
      try {
        const browserProvider = this.getBrowserProvider()
        if (!browserProvider) {
          return { success: false, error: "Provider de navegador no disponible" }
        }
        const { signer, chainId } = (await this.getSignerAndAddress()) || {}
        if (!signer || !chainId) return { success: false, error: "No hay signer disponible" }
        const addrInfo = this.getAddressesAndRpcByChainId(chainId)
        if (!addrInfo) return { success: false, error: "Contrato no configurado para esta red" }
        const contractWithSigner = new ethers.Contract(addrInfo.address, CONTRACT_ABI, signer)
        const tx = await (contractWithSigner as any).claimPrize(raffleId, prizeIndex)
        await tx.wait()
        return { success: true }
      } catch (error) {
        console.error("Error claiming prize:", error);
        return {
          success: false,
          error: "Error al reclamar premio"
        };
      }
    }

    // Simulación para desarrollo
    return {
      success: true
    };
  }
}

export const blockchainService = new BlockchainServiceImpl();
