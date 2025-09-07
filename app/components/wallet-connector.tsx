"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";

interface WalletConnectorProps {
  onWalletConnected: (address: string) => void;
}

export default function WalletConnector({ onWalletConnected }: WalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar si ya hay una wallet conectada
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          onWalletConnected(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask no está instalado. Por favor instala MetaMask para continuar.");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      // Solicitar conexión a la wallet
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        onWalletConnected(address);

        // Verificar si estamos en la red correcta (BASE Sepolia)
        await checkNetwork();
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        setError("Conexión cancelada por el usuario");
      } else {
        setError("Error al conectar la wallet. Intenta de nuevo.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const baseSepoliaChainId = "0x14a34"; // 84532 en decimal

      if (chainId !== baseSepoliaChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: baseSepoliaChainId }],
          });
        } catch (switchError: any) {
          // Si la red no existe, la agregamos
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
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setIsConnected(false);
    onWalletConnected("");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
          <p className="text-xs text-green-600">{formatAddress(walletAddress)}</p>
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
        
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? "Conectando..." : "Conectar MetaMask"}
        </Button>

        <div className="mt-4 text-xs text-gray-500">
          <p>Red: BASE Sepolia Testnet</p>
          <p>Necesitas ETH de testnet para participar</p>
        </div>
      </div>
    </div>
  );
}