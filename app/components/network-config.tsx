"use client"

import { useState } from 'react'
import { Button } from '../components/ui/button'

interface NetworkConfigProps {
  onNetworkConfigured?: () => void
}

export default function NetworkConfig({ onNetworkConfigured }: NetworkConfigProps) {
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const BASE_SEPOLIA_CONFIG = {
    chainId: '0x14a34', // 84532
    chainName: 'BASE Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  }

  const addBaseSepoliaNetwork = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('MetaMask no está instalado')
      return
    }

    setIsConfiguring(true)
    setError(null)

    try {
      // Intentar agregar la red
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BASE_SEPOLIA_CONFIG],
      })
      
      onNetworkConfigured?.()
    } catch (err: any) {
      if (err.code === 4902) {
        // Red ya existe, intentar cambiar a ella
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_SEPOLIA_CONFIG.chainId }],
          })
          onNetworkConfigured?.()
        } catch (switchErr: any) {
          setError(`Error al cambiar a BASE Sepolia: ${switchErr.message}`)
        }
      } else {
        setError(`Error al configurar la red: ${err.message}`)
      }
    } finally {
      setIsConfiguring(false)
    }
  }

  const checkNetwork = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('MetaMask no está instalado')
      return
    }

    try {
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' })
      if (chainId === BASE_SEPOLIA_CONFIG.chainId) {
        onNetworkConfigured?.()
      } else {
        setError(`Red incorrecta. Chain ID actual: ${chainId}, esperado: ${BASE_SEPOLIA_CONFIG.chainId}`)
      }
    } catch (err: any) {
      setError(`Error al verificar la red: ${err.message}`)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        ⚠️ Configuración de Red Requerida
      </h3>
      <p className="text-yellow-700 mb-4">
        Para usar Lo Gane, necesitas estar conectado a la red BASE Sepolia.
      </p>
      
      <div className="space-y-2">
        <Button 
          onClick={addBaseSepoliaNetwork}
          disabled={isConfiguring}
          className="w-full"
        >
          {isConfiguring ? 'Configurando...' : '🔧 Configurar BASE Sepolia'}
        </Button>
        
        <Button 
          onClick={checkNetwork}
          variant="outline"
          className="w-full"
        >
          🔍 Verificar Red Actual
        </Button>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 text-xs text-yellow-600">
        <p><strong>Red:</strong> BASE Sepolia</p>
        <p><strong>Chain ID:</strong> 84532</p>
        <p><strong>RPC:</strong> https://sepolia.base.org</p>
        <p><strong>Explorer:</strong> https://sepolia.basescan.org</p>
      </div>
    </div>
  )
}
