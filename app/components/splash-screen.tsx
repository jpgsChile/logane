'use client'

import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => {
            setIsVisible(false)
            setTimeout(onFinish, 300) // Esperar a que termine la animación
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(timer)
  }, [onFinish])

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        animation: 'fadeOut 0.3s ease-in-out forwards'
      }}
    >
      <div className="text-center text-white">
        {/* Logo/Icono */}
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-bounce">🏆</div>
          <h1 className="text-4xl font-bold mb-2">Lo Gane</h1>
          <p className="text-lg opacity-90">Rifas Descentralizadas</p>
        </div>

        {/* Barra de progreso */}
        <div className="w-64 mx-auto">
          <div className="bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm opacity-75">{progress}%</p>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-sm opacity-75">
          <p>Conectando con BASE Sepolia...</p>
          <p className="mt-2">Contrato: 0x6c59...F8F4</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}
