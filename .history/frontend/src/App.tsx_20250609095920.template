import { getCardDescription, getCardName } from '@shared/constants/cards';
import {
  Card as CardType,
  CardType as CardTypeEnum,
  ModuleColor,
} from '@shared/types/game';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
  isSelected?: boolean;
  className?: string;
  showAnimation?: boolean;
}

const cardVariants = {
  initial: {
    scale: 1,
    rotateY: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  hover: {
    scale: 1.05,
    rotateY: 5,
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
  selected: {
    scale: 1.02,
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    borderColor: '#3b82f6',
  },
};

const getCardTypeColor = (type: CardTypeEnum) => {
  switch (type) {
    case CardTypeEnum.MODULE:
      return 'bg-green-100 text-green-800 border-green-200';
    case CardTypeEnum.BUG:
      return 'bg-red-100 text-red-800 border-red-200';
    case CardTypeEnum.PATCH:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case CardTypeEnum.OPERATION:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getModuleColorStyles = (color?: ModuleColor | 'multicolor') => {
  if (!color) return '';

  switch (color) {
    case ModuleColor.BACKEND:
      return 'bg-teradeck-backend';
    case ModuleColor.FRONTEND:
      return 'bg-teradeck-frontend';
    case ModuleColor.MOBILE:
      return 'bg-teradeck-mobile';
    case ModuleColor.DATA_SCIENCE:
      return 'bg-teradeck-data-science';
    case 'multicolor':
      return 'bg-gradient-to-r from-blue-500 via-yellow-500 via-red-500 to-green-500 animate-shimmer';
    default:
      return 'bg-gray-400';
  }
};

const getCardBorderColor = (type: CardTypeEnum) => {
  switch (type) {
    case CardTypeEnum.MODULE:
      return 'border-l-green-500';
    case CardTypeEnum.BUG:
      return 'border-l-red-500';
    case CardTypeEnum.PATCH:
      return 'border-l-blue-500';
    case CardTypeEnum.OPERATION:
      return 'border-l-orange-500';
    default:
      return 'border-l-gray-500';
  }
};

export function Card({
  card,
  onClick,
  isPlayable = true,
  isSelected = false,
  className = '',
  showAnimation = true,
}: CardProps) {
  const { language, tUI } = useTranslation();

  const cardName = getCardName(card, language);
  const cardDescription = getCardDescription(card, language);
  const typeColor = getCardTypeColor(card.type);
  const borderColor = getCardBorderColor(card.type);
  const colorIndicatorStyles = getModuleColorStyles(card.color);

  const MotionComponent = showAnimation ? motion.div : 'div';

  return (
    <MotionComponent
      variants={showAnimation ? cardVariants : undefined}
      initial={showAnimation ? 'initial' : undefined}
      whileHover={showAnimation && isPlayable ? 'hover' : undefined}
      whileTap={showAnimation && isPlayable ? 'tap' : undefined}
      animate={isSelected ? 'selected' : 'initial'}
      className={`
        relative bg-white rounded-xl p-4 border-2 border-transparent
        ${borderColor} border-l-4
        min-h-[140px] flex flex-col cursor-pointer
        transition-all duration-200
        ${!isPlayable ? 'not-playable' : 'playable'}
        ${isSelected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        ${className}
      `}
      onClick={isPlayable ? onClick : undefined}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-sm text-gray-800 leading-tight">
            {cardName}
          </h3>
        </div>
        <div
          className={`
          px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
          border ${typeColor}
        `}
        >
          {tUI(`cards.${card.type}`)}
        </div>
      </div>

      {/* Card Description */}
      <p className="text-xs text-gray-600 mb-3 flex-1 leading-relaxed">
        {cardDescription}
      </p>

      {/* Card Footer */}
      <div className="flex justify-between items-center mt-auto">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {card.type}
        </div>

        {/* Color Indicator */}
        {card.color && (
          <div
            className={`
            w-5 h-5 rounded-full border-2 border-white shadow-md
            ${colorIndicatorStyles}
          `}
            title={card.color}
          />
        )}
      </div>

      {/* Glow effect for special states */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 pointer-events-none" />
      )}

      {/* Playable indicator */}
      {!isPlayable && (
        <div className="absolute inset-0 rounded-xl bg-gray-900/20 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
            {tUI('notPlayable')}
          </div>
        </div>
      )}
    </MotionComponent>
  );
}
