"use client"

import { useState, useEffect } from "react"

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  networkId: string | null
  balance: string | null
}

const BASE_SEPOLIA_CHAIN_ID = "0x14a34" // 84532 en decimal
const BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org"
const BASE_SEPOLIA_BLOCK_EXPLORER = "https://sepolia.basescan.org"

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    networkId: null,
    balance: null
  })

  const [isHydrated, setIsHydrated] = useState(false)

  // Obtener provider EIP-1193 (maneja múltiples providers)
  const getEthereum = (): any | null => {
    if (typeof window === 'undefined') return null
    const eth: any = (window as any).ethereum
    if (!eth) return null
    if (Array.isArray(eth.providers) && eth.providers.length > 0) {
      const metamask = eth.providers.find((p: any) => p && p.isMetaMask)
      return metamask || eth.providers[0]
    }
    return eth
  }

  // Verificar si MetaMask/algún provider está instalado
  const isMetaMaskInstalled = () => {
    if (typeof window === 'undefined') return false
    const eth: any = (window as any).ethereum
    return !!eth || (Array.isArray(eth?.providers) && eth.providers.length > 0)
  }

  // Efecto para manejar la hidratación
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Normalizar provider EIP-1193 (alias para métodos de eventos)
  useEffect(() => {
    if (!isHydrated || !isMetaMaskInstalled()) return

    try {
      const eth: any = getEthereum()
      if (!eth) return

      // Alias entre on/addListener
      if (typeof eth.on !== 'function' && typeof eth.addListener === 'function') {
        eth.on = eth.addListener.bind(eth)
      }
      if (typeof eth.addListener !== 'function' && typeof eth.on === 'function') {
        eth.addListener = eth.on.bind(eth)
      }

      // Alias entre off/removeListener
      if (typeof eth.off !== 'function' && typeof eth.removeListener === 'function') {
        eth.off = eth.removeListener.bind(eth)
      }
      if (typeof eth.removeListener !== 'function' && typeof eth.off === 'function') {
        eth.removeListener = eth.off.bind(eth)
      }

      // Polyfill simple de once
      if (typeof eth.once !== 'function' && typeof eth.on === 'function' && typeof eth.removeListener === 'function') {
        eth.once = (event: string, handler: (...args: any[]) => void) => {
          const onceHandler = (...args: any[]) => {
            try { eth.removeListener(event, onceHandler) } catch {}
            handler(...args)
          }
          eth.on(event, onceHandler)
        }
      }
    } catch (error) {
      console.error("Error normalizando provider EIP-1193:", error)
    }
  }, [isHydrated])

  // Bootstrap: detectar cuenta/red ya conectadas al montar
  useEffect(() => {
    if (!isHydrated || !isMetaMaskInstalled()) return
    (async () => {
      try {
        const eth: any = getEthereum()
        if (!eth) return
        const accounts: string[] = await eth.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          const address = accounts[0]
          setWalletState(prev => ({
            ...prev,
            address,
            isConnected: true,
            error: null
          }))
          await checkNetwork()
          await getBalance(address)
        }
      } catch (error) {
        console.error('Error bootstrapping wallet state:', error)
      }
    })()
  }, [isHydrated])

  // Efecto para escuchar cambios en la wallet
  useEffect(() => {
    if (!isHydrated || !isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletState(prev => ({
          ...prev,
          address,
          isConnected: true,
          error: null
        }))
        getBalance(address)
      } else {
        setWalletState(prev => ({
          ...prev,
          address: null,
          isConnected: false,
          balance: null
        }))
      }
    }

    const handleChainChanged = (chainId: string) => {
      setWalletState(prev => ({ ...prev, networkId: chainId }))
    }

    try {
      const eth: any = getEthereum()
      if (!eth) return

      const add = typeof eth.on === 'function'
        ? eth.on.bind(eth)
        : (typeof eth.addListener === 'function' ? eth.addListener.bind(eth) : null)

      const remove = typeof eth.removeListener === 'function'
        ? eth.removeListener.bind(eth)
        : (typeof eth.off === 'function' ? eth.off.bind(eth) : null)

      if (add) {
        add('accountsChanged', handleAccountsChanged)
        add('chainChanged', handleChainChanged)
      }

      // Limpiar listeners
      return () => {
        try {
          if (remove) {
            remove('accountsChanged', handleAccountsChanged)
            remove('chainChanged', handleChainChanged)
          }
        } catch (error) {
          console.error("Error removing wallet listeners:", error)
        }
      }
    } catch (error) {
      console.error("Error setting up wallet listeners:", error)
    }
  }, [isHydrated])

  // Conectar wallet
  const connectWallet = async () => {
    if (!isHydrated) {
      setWalletState(prev => ({
        ...prev,
        error: "Aplicación aún no está lista. Intenta de nuevo en unos segundos."
      }))
      return
    }

    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: "MetaMask no está instalado. Por favor instala MetaMask para continuar."
      }))
      return
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Solicitar conexión de cuentas
      const eth: any = getEthereum()
      if (!eth) throw new Error("No se detectó un provider EIP-1193 (MetaMask)")
      const accounts = await eth.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        await checkNetwork()
        await getBalance(address)
        
        setWalletState(prev => ({
          ...prev,
          address,
          isConnected: true,
          isConnecting: false,
          error: null
        }))
      } else {
        setWalletState(prev => ({
          ...prev,
          isConnecting: false,
          error: "No se pudo obtener acceso a las cuentas"
        }))
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.code === 4001 
          ? "Conexión cancelada por el usuario" 
          : error.message || "Error al conectar la wallet. Intenta de nuevo."
      }))
    }
  }

  // Verificar y cambiar red
  const checkNetwork = async () => {
    try {
      const eth: any = getEthereum()
      if (!eth) throw new Error("Provider no disponible")
      const chainId = await eth.request({ method: "eth_chainId" })
      
      setWalletState(prev => ({ ...prev, networkId: chainId }))

      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Red no existe, agregarla
            try {
              await eth.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: BASE_SEPOLIA_CHAIN_ID,
                    chainName: "BASE Sepolia",
                    nativeCurrency: {
                      name: "Ethereum",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: [BASE_SEPOLIA_RPC_URL],
                    blockExplorerUrls: [BASE_SEPOLIA_BLOCK_EXPLORER],
                  },
                ],
              })
            } catch (addError: any) {
              console.error("Error adding network:", addError)
              setWalletState(prev => ({
                ...prev,
                error: "Error al agregar la red BASE Sepolia. Agrégalo manualmente en MetaMask."
              }))
            }
          } else {
            console.error("Error switching network:", switchError)
            setWalletState(prev => ({
              ...prev,
              error: "Error al cambiar a BASE Sepolia. Cambia manualmente en MetaMask."
            }))
          }
        }
      }
    } catch (error) {
      console.error("Error checking network:", error)
      setWalletState(prev => ({
        ...prev,
        error: "Error al verificar la red. Verifica tu configuración de MetaMask."
      }))
    }
  }

  // Obtener balance
  const getBalance = async (address: string) => {
    try {
      const eth: any = getEthereum()
      if (!eth) throw new Error("Provider no disponible")
      const balance = await eth.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      
      // Convertir de wei a ETH
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
      
      setWalletState(prev => ({ ...prev, balance: balanceInEth }))
    } catch (error) {
      console.error("Error getting balance:", error)
    }
  }

  // Obtener ETH del faucet
  const getFaucetETH = async () => {
    if (!walletState.address) {
      setWalletState(prev => ({
        ...prev,
        error: "Debes conectar tu wallet primero"
      }))
      return
    }

    try {
      setWalletState(prev => ({ ...prev, isConnecting: true, error: null }))

      // Usar el faucet oficial de BASE Sepolia
      const faucetUrl = `https://bridge.base.org/deposit?address=${walletState.address}`
      
      // Abrir el faucet en una nueva pestaña
      window.open(faucetUrl, '_blank')
      
      // También intentar con el faucet alternativo
      const alternativeFaucetUrl = `https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet`
      
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: null
      }))

      // Mostrar instrucciones
      alert(`Faucet abierto en nueva pestaña. Si no funciona, también puedes usar: ${alternativeFaucetUrl}`)
      
    } catch (error) {
      console.error("Error getting faucet ETH:", error)
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: "Error al acceder al faucet. Intenta manualmente."
      }))
    }
  }

  // Desconectar wallet
  const disconnectWallet = () => {
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      networkId: null,
      balance: null
    })
  }

  // Formatear dirección
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Verificar si está en la red correcta
  const isCorrectNetwork = walletState.networkId === BASE_SEPOLIA_CHAIN_ID

  // Verificar si tiene balance suficiente
  const hasBalance = walletState.balance ? parseFloat(walletState.balance) > 0 : false

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    getFaucetETH,
    checkNetwork,
    formatAddress,
    isCorrectNetwork,
    hasBalance,
    isMetaMaskInstalled: isHydrated ? isMetaMaskInstalled() : false,
    isHydrated
  }
}
