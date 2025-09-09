"use client";

import { useEffect } from "react";
import { Button } from "./ui/button";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { useWallet } from "../../hooks/use-wallet";

interface WalletConnectorProps {
  onWalletConnected: (address: string) => void;
}

export default function WalletConnector({ onWalletConnected }: WalletConnectorProps) {
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
  } = useWallet();

  // Notificar al componente padre cuando cambie el estado de conexión
  useEffect(() => {
    if (isConnected && walletAddress) {
      onWalletConnected(walletAddress);
    } else if (!isConnected) {
      onWalletConnected("");
    }
  }, [isConnected, walletAddress, onWalletConnected]);

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  const handleGetFaucet = async () => {
    await getFaucetETH();
  };

  if (!isHydrated) {
    return (
      <div className="text-center">
        <div className="p-6 bg-white rounded-lg shadow-lg border">
          <div className="text-4xl mb-4">⏳</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cargando...
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Inicializando wallet
          </p>
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
            <p className="text-xs text-green-600">{formatAddress(walletAddress!)}</p>
            {balance && (
              <p className="text-xs text-green-600">Balance: {balance} ETH</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWallet}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            Desconectar
          </Button>
        </div>

        {/* Estado de la red y balance */}
        <div className="space-y-2">
          {!isCorrectNetwork && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
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
    );
  }

  return (
    <div className="text-center">
      <div className="p-6 bg-white rounded-lg shadow-lg border">
        <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Conectar Wallet
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Conecta tu wallet MetaMask para crear y participar en rifas
        </p>
        
        {walletError && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
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
          <Button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isConnecting ? "Conectando..." : "Conectar MetaMask"}
          </Button>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>Red: BASE Sepolia Testnet</p>
          <p>Necesitas ETH de testnet para participar</p>
        </div>
      </div>
    </div>
  );
}