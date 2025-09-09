"use client"

import { useState, useEffect } from 'react'
import { Button } from './ui/button'

interface DebugInfoProps {
  onClose?: () => void
}

export default function DebugInfo({ onClose }: DebugInfoProps) {
  const [debugData, setDebugData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const collectDebugInfo = async () => {
    setIsLoading(true)
    
    try {
      const info = {
        environment: {
          isProduction: process.env.NODE_ENV === 'production',
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
          contractAddress: process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS,
          rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
        },
        browser: {
          userAgent: navigator.userAgent,
          hasEthereum: !!(window as any).ethereum,
          ethereumProviders: (window as any).ethereum?.providers?.length || 0,
          isMetaMask: !!(window as any).ethereum?.isMetaMask,
        },
        wallet: {
          accounts: null as string[] | null,
          chainId: null as string | null,
          networkVersion: null as string | null,
          isConnected: false,
          error: null as string | null,
        },
        timestamp: new Date().toISOString()
      }

      // Intentar obtener información de la wallet
      if ((window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' })
          const networkVersion = await (window as any).ethereum.request({ method: 'net_version' })
          
          info.wallet = {
            accounts,
            chainId,
            networkVersion,
            isConnected: accounts && accounts.length > 0
          }
        } catch (error) {
          info.wallet.error = (error as Error).message
        }
      }

      setDebugData(info)
    } catch (error) {
      setDebugData({ error: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    collectDebugInfo()
  }, [])

  const copyToClipboard = () => {
    if (debugData) {
      navigator.clipboard.writeText(JSON.stringify(debugData, null, 2))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">🔍 Debug Info</h3>
            <div className="space-x-2">
              <Button onClick={copyToClipboard} size="sm" variant="outline">
                📋 Copiar
              </Button>
              <Button onClick={onClose} size="sm" variant="outline">
                ✕ Cerrar
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Recopilando información...</p>
            </div>
          ) : debugData ? (
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600">No se pudo recopilar información de debug.</p>
          )}
        </div>
      </div>
    </div>
  )
}
