import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../../components/common/Card';
import { Card as CardType, CardType as CardTypeEnum, ModuleColor } from '../../../../shared/src/types/game';

// Mock dependencies
jest.mock('@shared/constants/cards', () => ({
  getCardName: jest.fn((card, language) => card.name[language] || 'Test Card'),
  getCardDescription: jest.fn((card, language) => card.description[language] || 'Test Description'),
}));

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    language: 'es',
    tUI: (key: string) => {
      const translations: Record<string, string> = {
        'cards.module': 'Módulo',
        'cards.bug': 'Bug',
        'cards.patch': 'Parche',
        'cards.operation': 'Operación',
        'notPlayable': 'No jugable',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const createMockCard = (overrides: Partial<CardType> = {}): CardType => ({
  id: 'test-card-1',
  name: { es: 'Carta de Prueba', en: 'Test Card' },
  description: { es: 'Descripción de prueba', en: 'Test description' },
  type: CardTypeEnum.OPERATION,
  color: undefined,
  ...overrides,
});

describe('Card Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render card with basic information', () => {
      const card = createMockCard();
      render(<Card card={card} onClick={mockOnClick} />);

      expect(screen.getByText('Carta de Prueba')).toBeInTheDocument();
      expect(screen.getByText('Descripción de prueba')).toBeInTheDocument();
      expect(screen.getByText('Operación')).toBeInTheDocument();
    });

    it('should render card type badge', () => {
      const card = createMockCard({ type: CardTypeEnum.MODULE });
      render(<Card card={card} />);

      expect(screen.getByText('Módulo')).toBeInTheDocument();
    });

    it('should display correct card type in footer', () => {
      const card = createMockCard({ type: CardTypeEnum.BUG });
      render(<Card card={card} />);

      expect(screen.getByText('bug')).toBeInTheDocument();
    });
  });

  describe('Card Types and Colors', () => {
    it('should render module card with correct styling', () => {
      const card = createMockCard({ 
        type: CardTypeEnum.MODULE,
        color: ModuleColor.BACKEND 
      });
      render(<Card card={card} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('.border-l-green-500');
      expect(cardElement).toBeInTheDocument();
    });

    it('should render bug card with correct styling', () => {
      const card = createMockCard({ type: CardTypeEnum.BUG });
      render(<Card card={card} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('.border-l-red-500');
      expect(cardElement).toBeInTheDocument();
    });

    it('should render patch card with correct styling', () => {
      const card = createMockCard({ type: CardTypeEnum.PATCH });
      render(<Card card={card} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('.border-l-blue-500');
      expect(cardElement).toBeInTheDocument();
    });

    it('should render operation card with correct styling', () => {
      const card = createMockCard({ type: CardTypeEnum.OPERATION });
      render(<Card card={card} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('.border-l-orange-500');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Module Colors', () => {
    it('should display backend module color', () => {
      const card = createMockCard({ 
        type: CardTypeEnum.MODULE,
        color: ModuleColor.BACKEND 
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('backend');
      expect(colorIndicator).toHaveClass('bg-teradeck-backend');
    });

    it('should display frontend module color', () => {
      const card = createMockCard({ 
        type: CardTypeEnum.MODULE,
        color: ModuleColor.FRONTEND 
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('frontend');
      expect(colorIndicator).toHaveClass('bg-teradeck-frontend');
    });

    it('should display mobile module color', () => {
      const card = createMockCard({ 
        type: CardTypeEnum.MODULE,
        color: ModuleColor.MOBILE 
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('mobile');
      expect(colorIndicator).toHaveClass('bg-teradeck-mobile');
    });

    it('should display data science module color', () => {
      const card = createMockCard({ 
        type: CardTypeEnum.MODULE,
        color: ModuleColor.DATA_SCIENCE 
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('dataScience');
      expect(colorIndicator).toHaveClass('bg-teradeck-data-science');
    });

    it('should display multicolor module with gradient', () => {
      const card = createMockCard({ 
        type: CardTypeEnum.MODULE,
        color: 'multicolor' as any
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('multicolor');
      expect(colorIndicator).toHaveClass('bg-gradient-to-r');
      expect(colorIndicator).toHaveClass('animate-shimmer');
    });

    it('should not display color indicator for cards without color', () => {
      const card = createMockCard({ color: undefined });
      render(<Card card={card} />);

      expect(screen.queryByTitle(/backend|frontend|mobile|dataScience/)).not.toBeInTheDocument();
    });
  });

  describe('Interaction States', () => {
    it('should handle click when playable', () => {
      const card = createMockCard();
      render(<Card card={card} onClick={mockOnClick} isPlayable={true} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      fireEvent.click(cardElement);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not handle click when not playable', () => {
      const card = createMockCard();
      render(<Card card={card} onClick={mockOnClick} isPlayable={false} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      fireEvent.click(cardElement);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should show not playable overlay when isPlayable is false', () => {
      const card = createMockCard();
      render(<Card card={card} isPlayable={false} />);

      expect(screen.getByText('No jugable')).toBeInTheDocument();
    });

    it('should apply selected styling when isSelected is true', () => {
      const card = createMockCard();
      render(<Card card={card} isSelected={true} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      expect(cardElement).toHaveClass('ring-2', 'ring-blue-400');
    });

    it('should show glow effect when selected', () => {
      const card = createMockCard();
      render(<Card card={card} isSelected={true} />);

      const glowElement = document.querySelector('.bg-gradient-to-r.from-blue-400\\/20');
      expect(glowElement).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const card = createMockCard();
      render(<Card card={card} className="custom-class" />);

      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      expect(cardElement).toHaveClass('custom-class');
    });

    it('should apply playable class when playable', () => {
      const card = createMockCard();
      render(<Card card={card} isPlayable={true} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      expect(cardElement).toHaveClass('playable');
    });

    it('should apply not-playable class when not playable', () => {
      const card = createMockCard();
      render(<Card card={card} isPlayable={false} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      expect(cardElement).toHaveClass('not-playable');
    });
  });

  describe('Animation Control', () => {
    it('should disable animations when showAnimation is false', () => {
      const card = createMockCard();
      render(<Card card={card} showAnimation={false} />);

      // When showAnimation is false, it should render a div instead of motion.div
      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      expect(cardElement).toBeInTheDocument();
    });

    it('should enable animations by default', () => {
      const card = createMockCard();
      render(<Card card={card} />);

      // By default showAnimation should be true
      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Type Badge Colors', () => {
    it('should apply correct color for module type badge', () => {
      const card = createMockCard({ type: CardTypeEnum.MODULE });
      render(<Card card={card} />);

      const badge = screen.getByText('Módulo');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
    });

    it('should apply correct color for bug type badge', () => {
      const card = createMockCard({ type: CardTypeEnum.BUG });
      render(<Card card={card} />);

      const badge = screen.getByText('Bug');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200');
    });

    it('should apply correct color for patch type badge', () => {
      const card = createMockCard({ type: CardTypeEnum.PATCH });
      render(<Card card={card} />);

      const badge = screen.getByText('Parche');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');
    });

    it('should apply correct color for operation type badge', () => {
      const card = createMockCard({ type: CardTypeEnum.OPERATION });
      render(<Card card={card} />);

      const badge = screen.getByText('Operación');
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-800', 'border-orange-200');
    });
  });

  describe('Accessibility', () => {
    it('should have cursor-pointer when playable', () => {
      const card = createMockCard();
      render(<Card card={card} isPlayable={true} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      expect(cardElement).toHaveClass('cursor-pointer');
    });

    it('should display card type in uppercase', () => {
      const card = createMockCard({ type: CardTypeEnum.OPERATION });
      render(<Card card={card} />);

      const typeElement = screen.getByText('operation');
      expect(typeElement).toHaveClass('uppercase');
    });
  });

  describe('Language Support', () => {
    it('should use language from translation hook', () => {
      const card = createMockCard({
        name: { es: 'Carta en Español', en: 'Card in English' },
        description: { es: 'Descripción en español', en: 'Description in English' },
      });

      const { getCardName, getCardDescription } = require('@shared/constants/cards');
      
      render(<Card card={card} />);

      expect(getCardName).toHaveBeenCalledWith(card, 'es');
      expect(getCardDescription).toHaveBeenCalledWith(card, 'es');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing card properties gracefully', () => {
      const incompleteCard = {
        id: 'incomplete',
        type: CardTypeEnum.OPERATION,
      } as CardType;

      expect(() => {
        render(<Card card={incompleteCard} />);
      }).not.toThrow();
    });

    it('should handle unknown card type', () => {
      const unknownTypeCard = createMockCard({ type: 'unknown' as any });
      render(<Card card={unknownTypeCard} />);

      const cardElement = screen.getByText('Carta de Prueba').closest('div');
      expect(cardElement).toHaveClass('border-l-gray-500');
    });

    it('should handle unknown module color', () => {
      const unknownColorCard = createMockCard({ 
        type: CardTypeEnum.MODULE,
        color: 'unknown' as any 
      });
      render(<Card card={unknownColorCard} />);

      const colorIndicator = screen.getByTitle('unknown');
      expect(colorIndicator).toHaveClass('bg-gray-400');
    });
  });
}); 