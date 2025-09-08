"use client"

import { useState, useEffect } from "react"
import { blockchainService } from "../../lib/blockchain"
import type { Raffle } from "../../lib/types"
import { PaymentToken } from "../../lib/types"
import CreateRaffleDialog from "../components/create-raffle-dialog"
import RaffleCard from "../components/raffle-card"
import { useWallet } from "../../hooks/use-wallet"

export default function LoGaneApp() {
  const {
    address: walletAddress,
    isConnected,
    isConnecting,
    error: walletError,
    balance,
    connectWallet,
    disconnectWallet,
    getFaucetETH,
    formatAddress,
    isCorrectNetwork,
    hasBalance,
    isMetaMaskInstalled,
    isHydrated
  } = useWallet()
  
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [userRaffles, setUserRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingUserRaffles, setLoadingUserRaffles] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'my-raffles'>('active')

  // Función para manejar la conexión de wallet
  const handleConnectWallet = async () => {
    await connectWallet()
  }

  // Función para manejar el faucet
  const handleGetFaucet = async () => {
    await getFaucetETH()
  }

  // Abrir diálogo de crear rifa solo si la wallet está conectada y en condiciones
  const openCreateDialog = () => {
    if (!isHydrated) return
    if (!isConnected) {
      alert("Conecta tu wallet para crear una rifa")
      return
    }
    if (!isCorrectNetwork) {
      alert("Cambia a BASE Sepolia testnet para crear una rifa")
      return
    }
    if (!hasBalance) {
      alert("No tienes ETH suficiente. Usa el faucet para obtener ETH de testnet")
      return
    }
    setShowCreateDialog(true)
  }

  // Cargar rifas activas
  const loadRaffles = async () => {
    setLoading(true)
    try {
      const activeRaffles = await blockchainService.getActiveRaffles()
      setRaffles(activeRaffles)
    } catch (error) {
      console.error("Error loading raffles:", error)
      alert("Error al cargar las rifas")
    } finally {
      setLoading(false)
    }
  }

  // Cargar rifas del usuario (solo cuando se necesite)
  const loadUserRaffles = async () => {
    if (!walletAddress) return
    
    setLoadingUserRaffles(true)
    try {
      const userRafflesData = await blockchainService.getUserRaffles(walletAddress)
      setUserRaffles(userRafflesData)
    } catch (error) {
      console.error("Error loading user raffles:", error)
      alert("Error al cargar tus rifas")
    } finally {
      setLoadingUserRaffles(false)
    }
  }

  // Participar en una rifa
  const participateInRaffle = async (raffleId: number) => {
    if (!walletAddress) {
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

    try {
      const result = await blockchainService.joinRaffle(raffleId, walletAddress)
      if (result.success) {
        // Recargar rifas para actualizar el contador de participantes
        await loadRaffles()
        alert("¡Te has unido a la rifa exitosamente!")
      } else {
        alert(result.error || "Error al participar en la rifa")
      }
    } catch (error) {
      console.error("Error participating in raffle:", error)
      alert("Error al participar en la rifa")
    }
  }

  // Función para cambiar de pestaña y cargar datos si es necesario
  const handleTabChange = (tab: 'active' | 'my-raffles') => {
    setActiveTab(tab)
    if (tab === 'active' && raffles.length === 0 && !loading) {
      loadRaffles()
    }
    if (tab === 'my-raffles' && userRaffles.length === 0 && !loadingUserRaffles) {
      loadUserRaffles()
    }
  }

  // Cerrar el diálogo si la wallet se desconecta
  useEffect(() => {
    if (!isConnected && showCreateDialog) {
      setShowCreateDialog(false)
    }
  }, [isConnected, showCreateDialog])

  // Función para formatear el precio del ticket
  const formatTicketPrice = (price: number, paymentToken: PaymentToken) => {
    const { ethers } = require("ethers")
    const formattedPrice = ethers.formatEther(price.toString())
    const tokenSymbol = paymentToken === PaymentToken.ETH ? "ETH" : 
                      paymentToken === PaymentToken.USDT ? "USDT" : "USDC"
    return `${formattedPrice} ${tokenSymbol}`
  }

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000) // Convertir a segundos
    const diff = endTime - now
    
    if (diff <= 0) return "Finalizada"
    
    const days = Math.floor(diff / (24 * 60 * 60))
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((diff % (60 * 60)) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <img 
              src="/logo.png" 
              alt="Lo Gane Logo" 
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-4xl font-bold text-gray-900">
              Lo Gane
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Rifas Descentralizadas Transparentes en BASE
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          {!isHydrated ? (
            <div className="text-center">
              <div className="p-6 bg-white rounded-lg shadow-lg border">
                <div className="text-4xl mb-4">⏳</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cargando...
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Inicializando aplicación
                </p>
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            </div>
          ) : walletError ? (
            <div className="text-center">
              <div className="p-6 bg-red-50 rounded-lg shadow-lg border border-red-200">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Error de Conexión
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  {walletError}
                </p>
                <button
                  onClick={handleConnectWallet}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Reintentar Conexión
                </button>
              </div>
            </div>
          ) : !isConnected ? (
            <div className="text-center">
              <div className="p-6 bg-white rounded-lg shadow-lg border">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Conectar Wallet
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Conecta tu wallet MetaMask para crear y participar en rifas
                </p>
                
                {walletError && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-600">⚠️</div>
                    <p className="text-sm text-red-700">{walletError}</p>
                  </div>
                )}

                {!isMetaMaskInstalled ? (
                  <div className="space-y-3">
                    <p className="text-sm text-red-600 mb-3">
                      MetaMask no está instalado
                    </p>
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                    >
                      Instalar MetaMask
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isConnecting ? "Conectando..." : "Conectar MetaMask"}
                  </button>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  <p>Red: BASE Sepolia Testnet</p>
                  <p>Necesitas ETH de testnet para participar</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-3">
                <div className="text-green-600">✅</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
                  <p className="text-xs text-green-600">{formatAddress(walletAddress!)}</p>
                  {balance && (
                    <p className="text-xs text-green-600">Balance: {balance} ETH</p>
                  )}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-green-700 border border-green-300 px-3 py-1 rounded text-sm hover:bg-green-100"
                >
                  Desconectar
                </button>
              </div>

              {/* Estado de la red y balance */}
              <div className="space-y-2">
                {!isCorrectNetwork && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-yellow-600">⚠️</div>
                    <p className="text-sm text-yellow-700">Cambia a BASE Sepolia testnet</p>
                  </div>
                )}

                {isCorrectNetwork && !hasBalance && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-blue-600">💧</div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-700">Obtén ETH de testnet</p>
                      <button
                        onClick={handleGetFaucet}
                        className="text-xs text-blue-600 underline hover:text-blue-800"
                      >
                        Usar Faucet
                      </button>
                    </div>
                  </div>
                )}

                {isCorrectNetwork && hasBalance && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-green-600">🎉</div>
                    <p className="text-sm text-green-700">¡Listo para participar en rifas!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isHydrated && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex justify-center">
              <div className="bg-white rounded-lg p-1 shadow-sm">
                <button 
                  onClick={() => handleTabChange('active')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'active'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Rifas Activas
                </button>
                <button 
                  onClick={() => isConnected && handleTabChange('my-raffles')}
                  disabled={!isConnected}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'my-raffles'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isConnected ? '' : 'Conecta tu wallet para ver tus rifas'}
                >
                  Mis Rifas
                </button>
                <button 
                  onClick={openCreateDialog}
                  disabled={!isConnected}
                  className={`px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md text-sm font-medium transition-all duration-200 ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isConnected ? '' : 'Conecta tu wallet para crear una rifa'}
                >
                  Crear Rifa
                </button>
              </div>
            </div>

            {/* Contenido de las pestañas */}
            {activeTab === 'active' ? (
              /* Rifas Activas */
              loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-600">Cargando rifas activas...</p>
                </div>
              ) : raffles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {loading ? 'Cargando...' : 'Ver Rifas Activas'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {loading ? 'Buscando rifas disponibles...' : 'Haz clic para ver las rifas activas disponibles'}
                  </p>
                  {!loading && (
                    <button 
                      onClick={() => loadRaffles()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                    >
                      Cargar Rifas Activas
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {raffles.map((raffle) => (
                    <RaffleCard
                      key={raffle.id}
                      raffle={raffle}
                      onParticipate={loadRaffles}
                    />
                  ))}
                </div>
              )
            ) : (
              /* Mis Rifas */
              !isConnected ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Conecta tu wallet</h3>
                  <p className="text-gray-600 mb-4">Conecta tu wallet para ver y administrar tus rifas</p>
                </div>
              ) : loadingUserRaffles ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-600">Cargando tus rifas...</p>
                </div>
              ) : userRaffles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No has creado rifas</h3>
                  <p className="text-gray-600 mb-4">Crea tu primera rifa y compártela con la comunidad</p>
                  <button 
                    onClick={openCreateDialog}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Crear Mi Primera Rifa
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userRaffles.map((raffle) => (
                    <RaffleCard
                      key={raffle.id}
                      raffle={raffle}
                      onParticipate={loadRaffles}
                    />
                  ))}
                </div>
              )
            )}

            {/* Crear Rifa */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Crear Nueva Rifa</h3>
              <p className="text-gray-600 mb-6">
                Crea una rifa con hasta 9 premios y deja que la blockchain seleccione los ganadores de forma transparente
              </p>
              
              <div className="text-center py-8">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-sm">Define hasta 9 premios únicos</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm">Establece precio de entrada y participantes</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-sm">La blockchain selecciona ganadores automáticamente</span>
                  </div>
                </div>
                <button 
                  onClick={openCreateDialog}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Crear Rifa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diálogo de Crear Rifa */}
        {showCreateDialog && isHydrated && isConnected && (
          <CreateRaffleDialog 
            onClose={() => setShowCreateDialog(false)}
            onSuccess={() => {
              setShowCreateDialog(false)
              // Recargar rifas activas y cambiar a la pestaña de mis rifas
              loadRaffles()
              loadUserRaffles()
              setActiveTab('my-raffles')
            }}
          />
        )}
      </div>
    </div>
  )
}