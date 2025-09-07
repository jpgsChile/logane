"use client"

import { useState, useEffect } from "react"

export default function LoGaneApp() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask no está instalado. Por favor instala MetaMask para continuar.")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        await checkNetwork()
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.code === 4001) {
        setError("Conexión cancelada por el usuario")
      } else {
        setError("Error al conectar la wallet. Intenta de nuevo.")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      const baseSepoliaChainId = "0x14a34" // 84532 en decimal

      if (chainId !== baseSepoliaChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: baseSepoliaChainId }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: baseSepoliaChainId,
                  chainName: "BASE Sepolia",
                  nativeCurrency: {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://sepolia.base.org"],
                  blockExplorerUrls: ["https://sepolia.basescan.org"],
                },
              ],
            })
          }
        }
      }
    } catch (error) {
      console.error("Error checking network:", error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const mockRaffles = [
    {
      id: 1,
      title: "Rifa iPhone 15 Pro",
      description: "Gana el último iPhone 15 Pro",
      prizeCount: 3,
      ticketPrice: "0.01",
      maxParticipants: 100,
      participants: 45,
      endTime: Date.now() + 86400000,
      isActive: true,
      prizes: [
        { name: "iPhone 15 Pro", value: "0.5" },
        { name: "AirPods Pro", value: "0.2" },
        { name: "Gift Card $100", value: "0.1" }
      ]
    },
    {
      id: 2,
      title: "Rifa Gaming Setup",
      description: "Setup completo para gaming",
      prizeCount: 2,
      ticketPrice: "0.02",
      maxParticipants: 50,
      participants: 23,
      endTime: Date.now() + 172800000,
      isActive: true,
      prizes: [
        { name: "PC Gaming", value: "1.0" },
        { name: "Monitor 4K", value: "0.3" }
      ]
    }
  ]

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now()
    const diff = endTime - now
    
    if (diff <= 0) return "Finalizada"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Lo Gane
          </h1>
          <p className="text-lg text-gray-600">
            Rifas Descentralizadas Transparentes en BASE
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          {!walletAddress ? (
            <div className="text-center">
              <div className="p-6 bg-white rounded-lg shadow-lg border">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Conectar Wallet
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Conecta tu wallet MetaMask para crear y participar en rifas
                </p>
                
                {error && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-600">⚠️</div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? "Conectando..." : "Conectar MetaMask"}
                </button>

                <div className="mt-4 text-xs text-gray-500">
                  <p>Red: BASE Sepolia Testnet</p>
                  <p>Necesitas ETH de testnet para participar</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600">✅</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
                <p className="text-xs text-green-600">{formatAddress(walletAddress)}</p>
              </div>
              <button
                onClick={() => setWalletAddress("")}
                className="text-green-700 border border-green-300 px-3 py-1 rounded text-sm hover:bg-green-100"
              >
                Desconectar
              </button>
            </div>
          )}
        </div>

        {walletAddress && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex justify-center">
              <div className="bg-white rounded-lg p-1 shadow-sm">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
                  Rifas Activas
                </button>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium ml-1">
                  Mis Rifas
                </button>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium ml-1">
                  Crear Rifa
                </button>
              </div>
            </div>

            {/* Rifas Activas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockRaffles.map((raffle) => (
                <div key={raffle.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{raffle.title}</h3>
                      <p className="text-gray-600 text-sm">{raffle.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      raffle.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {raffle.isActive ? 'Activa' : 'Finalizada'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">🏆</span>
                      <span>{raffle.prizeCount} premios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">👥</span>
                      <span>{raffle.participants}/{raffle.maxParticipants}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">⏰</span>
                      <span>{formatTimeRemaining(raffle.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">💰</span>
                      <span>{raffle.ticketPrice} ETH</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm text-gray-900">Premios:</h4>
                    {raffle.prizes.slice(0, raffle.prizeCount).map((prize: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{prize.name}</span>
                        <span className="font-medium text-gray-900">{prize.value} ETH</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                      Participar
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Crear Rifa */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Crear Nueva Rifa</h3>
              <p className="text-gray-600 mb-6">
                Crea una rifa con hasta 9 premios y deja que la blockchain seleccione los ganadores de forma transparente
              </p>
              
              <div className="text-center py-8">
                <h4 className="text-lg font-semibold mb-4">Funcionalidad en Desarrollo</h4>
                <p className="text-gray-600 mb-6">
                  La funcionalidad completa de crear rifas estará disponible próximamente
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-sm">Define hasta 9 premios únicos</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm">Establece precio de entrada y participantes</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-sm">La blockchain selecciona ganadores automáticamente</span>
                  </div>
                </div>
                <button 
                  className="mt-6 bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                  disabled
                >
                  Crear Rifa (Próximamente)
                </button>
              </div>
            </div>
          </div>
        )}

        {!walletAddress && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Conecta tu Wallet para Comenzar
              </h2>
              <p className="text-gray-600 mb-6">
                Necesitas conectar tu wallet MetaMask a BASE Sepolia para crear y participar en rifas
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-sm">Instala MetaMask si no lo tienes</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-sm">Conecta a BASE Sepolia testnet</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-sm">Obtén ETH de testnet desde el faucet</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}