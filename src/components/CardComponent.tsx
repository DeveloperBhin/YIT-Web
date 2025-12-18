'use client';

import { Card } from '../types/game';

interface CardComponentProps {
  card: Card;
  size?: 'small' | 'medium' | 'large';
  isPlayable?: boolean;
  isSelected?: boolean;
}

export default function CardComponent({ 
  card, 
  size = 'medium', 
  isPlayable = false, 
  isSelected = false 
}: CardComponentProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-18 text-xs';
      case 'medium':
        return 'w-16 h-24 text-sm';
      case 'large':
        return 'w-24 h-36 text-lg';
      default:
        return 'w-16 h-24 text-sm';
    }
  };

  const getColorClasses = () => {
    if (card.color === 'wild') {
      return 'bg-gradient-to-br from-purple-400 to-pink-500';
    }
    
    switch (card.color) {
      case 'red':
        return 'bg-gradient-to-br from-red-400 to-red-600';
      case 'blue':
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
      case 'green':
        return 'bg-gradient-to-br from-green-400 to-green-600';
      case 'yellow':
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getTextColor = () => {
    if (card.color === 'yellow') {
      return 'text-black';
    }
    return 'text-white';
  };

  const getCardSymbol = () => {
    switch (card.type) {
      case 'skip':
        return '⏭️';
      case 'reverse':
        return '🔄';
      case 'draw2':
        return '+2';
      case 'wild':
        return '🎨';
      case 'wild_draw4':
        return '+4';
      default:
        return card.value;
    }
  };

  const getCardIcon = () => {
    switch (card.type) {
      case 'skip':
        return '⏭️';
      case 'reverse':
        return '🔄';
      case 'draw2':
        return '📈';
      case 'wild':
        return '🎨';
      case 'wild_draw4':
        return '📈';
      default:
        return null;
    }
  };

  const sizeClasses = getSizeClasses();
  const colorClasses = getColorClasses();
  const textColor = getTextColor();
  const symbol = getCardSymbol();
  const icon = getCardIcon();

  return (
    <div
      className={`
        ${sizeClasses}
        ${colorClasses}
        ${textColor}
        ${isPlayable ? 'cursor-pointer' : 'cursor-default'}
        ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
        ${isPlayable && !isSelected ? 'hover:ring-2 hover:ring-white hover:ring-opacity-50' : ''}
        rounded-lg border-2 border-white shadow-lg transition-all duration-200
        flex flex-col items-center justify-center font-bold
        relative overflow-hidden
      `}
    >
      {/* Card Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1 left-1 text-xs">
          {symbol}
        </div>
        <div className="absolute bottom-1 right-1 text-xs transform rotate-180">
          {symbol}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {icon && (
          <div className="text-lg mb-1">
            {icon}
          </div>
        )}
        
        <div className="text-center">
          <div className="font-bold leading-tight">
            {symbol}
          </div>
          
          {card.type === 'number' && (
            <div className="text-xs opacity-75 mt-1">
              {card.color}
            </div>
          )}
        </div>
      </div>

      {/* Special Effects for Wild Cards */}
      {card.color === 'wild' && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse"></div>
      )}

      {/* Playable Indicator */}
      {isPlayable && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
      )}
    </div>
  );
}
