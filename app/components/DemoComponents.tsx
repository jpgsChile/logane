"use client";

import React from 'react';

interface ButtonProps {
  variant?: 'ghost' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  icon,
  children,
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    ghost: 'hover:bg-gray-100 text-gray-700',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

interface IconProps {
  name: 'plus' | 'check' | 'home' | 'star' | 'gift' | 'users' | 'trophy';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconMap = {
    plus: (
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    check: (
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    home: (
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    star: (
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    gift: (
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    users: (
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    trophy: (
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  };

  return (
    <span className={className}>
      {iconMap[name]}
    </span>
  );
};

interface HomeProps {
  setActiveTab: (tab: string) => void;
  isConnected?: boolean;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab, isConnected = false }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <img 
            src="/logo.png" 
            alt="Lo Gane Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Lo Gane
          </h1>
        </div>
        <p className="text-gray-600 mb-6">
          Rifas Descentralizadas Transparentes en BASE
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="primary"
          className="flex flex-col items-center p-6 h-24 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={() => setActiveTab('features')}
        >
          <Icon name="gift" size="lg" className="mb-2" />
          <span className="text-sm font-medium">Ver Rifas</span>
        </Button>
        
        <Button
          variant="secondary"
          className={`flex flex-col items-center p-6 h-24 ${
            isConnected 
              ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200 border border-purple-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => isConnected && window.open('/lo-gane', '_blank')}
        >
          <Icon name="trophy" size="lg" className="mb-2" />
          <span className="text-sm font-medium">
            {isConnected ? 'Crear Rifa' : 'Conecta Wallet'}
          </span>
        </Button>
      </div>

      {!isConnected && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Conecta tu Wallet</h3>
          <p className="text-sm text-yellow-800 mb-3">
            Necesitas conectar tu wallet MetaMask para crear y participar en rifas
          </p>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>• Instala MetaMask si no lo tienes</div>
            <div>• Conecta a BASE Sepolia testnet</div>
            <div>• Obtén ETH de testnet desde el faucet</div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
        <h3 className="font-semibold text-purple-900 mb-2">¿Cómo funciona?</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Crea o participa en rifas</li>
          <li>• Gana premios únicos</li>
          <li>• Todo en la blockchain</li>
        </ul>
      </div>
    </div>
  );
};

interface FeaturesProps {
  setActiveTab: (tab: string) => void;
}

export const Features: React.FC<FeaturesProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setActiveTab('home')}
          className="text-purple-700 hover:bg-purple-50"
        >
          <Icon name="home" size="sm" className="mr-2" />
          Inicio
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Características</h2>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <Icon name="gift" className="text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">Hasta 9 Premios</h3>
              <p className="text-sm text-gray-600">Crea rifas con múltiples premios</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <Icon name="users" className="text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Participación Justa</h3>
              <p className="text-sm text-gray-600">Algoritmo transparente de selección</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <Icon name="trophy" className="text-purple-600" />
            <div>
              <h3 className="font-medium text-gray-900">Blockchain Segura</h3>
              <p className="text-sm text-gray-600">Todo verificado en la red</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
