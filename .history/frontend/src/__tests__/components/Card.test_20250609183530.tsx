import {
  Card as CardType,
  CardType as CardTypeEnum,
  ModuleColor,
} from '@shared/types/game';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Card } from '../../components/common/Card';

// Mock dependencies
jest.mock('@shared/constants/cards', () => ({
  getCardName: jest.fn((card, language) => {
    if (!card || !card.name) return 'Test Card';
    if (card.name.en) return card.name.en; // Always return English for tests
    return card.name[language] || 'Test Card';
  }),
  getCardDescription: jest.fn((card, language) => {
    if (!card || !card.description) return 'Test description';
    if (card.description.en) return card.description.en; // Always return English for tests
    return card.description[language] || 'Test description';
  }),
  getCardTypeLabel: jest.fn((type, language) => {
    const labels: Record<string, Record<string, string>> = {
      module: { es: 'Módulo', en: 'Module' },
      bug: { es: 'Bug', en: 'Bug' },
      patch: { es: 'Parche', en: 'Patch' },
      operation: { es: 'Operación', en: 'Operation' },
    };
    return labels[type]?.en || labels[type]?.es || type; // Prefer English for tests
  }),
  getCardColorName: jest.fn((color, language) => {
    const colorNames: Record<string, Record<string, string>> = {
      data_science: { es: 'cienciaDatos', en: 'dataScience' },
      frontend: { es: 'frontend', en: 'frontend' },
      backend: { es: 'backend', en: 'backend' },
      devops: { es: 'devops', en: 'devops' },
      mobile: { es: 'movil', en: 'mobile' },
    };
    return colorNames[color]?.en || colorNames[color]?.es || color; // Prefer English for tests
  }),
}));

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    tUI: (key: string) => {
      const translations: Record<string, string> = {
        'cards.module': 'Module',
        'cards.bug': 'Bug',
        'cards.patch': 'Patch',
        'cards.operation': 'Operation',
        notPlayable: 'Not playable',
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
  const mockCard = {
    id: 'test-card',
    name: { es: 'Carta de Prueba', en: 'Test Card' },
    description: { es: 'Descripción de prueba', en: 'Test description' },
    type: 'operation' as any,
    color: undefined,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render card with basic information', () => {
    render(<Card card={mockCard} onClick={mockOnClick} />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should handle click when playable', () => {
    render(<Card card={mockCard} onClick={mockOnClick} isPlayable={true} />);

    const cardElement = screen.getByText('Test Card').closest('div');
    fireEvent.click(cardElement);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should not handle click when not playable', () => {
    render(<Card card={mockCard} onClick={mockOnClick} isPlayable={false} />);

    const cardElement = screen.getByText('Test Card').closest('div');
    fireEvent.click(cardElement);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  describe('Basic Rendering', () => {
    it('should render card with basic information', () => {
      const card = createMockCard();
      render(<Card card={card} onClick={mockOnClick} />);

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Operation')).toBeInTheDocument();
    });

    it('should render card type badge', () => {
      const card = createMockCard({ type: CardTypeEnum.MODULE });
      render(<Card card={card} />);

      expect(screen.getByText('Module')).toBeInTheDocument();
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
        color: ModuleColor.BACKEND,
      });
      render(<Card card={card} />);

      const cardElement = screen
        .getByText('Test Card')
        .closest('.border-l-green-500');
      expect(cardElement).toBeInTheDocument();
    });

    it('should render bug card with correct styling', () => {
      const card = createMockCard({ type: CardTypeEnum.BUG });
      render(<Card card={card} />);

      const cardElement = screen
        .getByText('Test Card')
        .closest('.border-l-red-500');
      expect(cardElement).toBeInTheDocument();
    });

    it('should render patch card with correct styling', () => {
      const card = createMockCard({ type: CardTypeEnum.PATCH });
      render(<Card card={card} />);

      const cardElement = screen
        .getByText('Test Card')
        .closest('.border-l-blue-500');
      expect(cardElement).toBeInTheDocument();
    });

    it('should render operation card with correct styling', () => {
      const card = createMockCard({ type: CardTypeEnum.OPERATION });
      render(<Card card={card} />);

      const cardElement = screen
        .getByText('Test Card')
        .closest('.border-l-orange-500');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Module Colors', () => {
    it('should display backend module color', () => {
      const card = createMockCard({
        type: CardTypeEnum.MODULE,
        color: ModuleColor.BACKEND,
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('backend');
      expect(colorIndicator).toHaveClass('bg-teradeck-backend');
    });

    it('should display frontend module color', () => {
      const card = createMockCard({
        type: CardTypeEnum.MODULE,
        color: ModuleColor.FRONTEND,
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('frontend');
      expect(colorIndicator).toHaveClass('bg-teradeck-frontend');
    });

    it('should display mobile module color', () => {
      const card = createMockCard({
        type: CardTypeEnum.MODULE,
        color: ModuleColor.MOBILE,
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('mobile');
      expect(colorIndicator).toHaveClass('bg-teradeck-mobile');
    });

    it('should display data science module color', () => {
      const card = createMockCard({
        type: CardTypeEnum.MODULE,
        color: ModuleColor.DATA_SCIENCE,
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('data_science');
      expect(colorIndicator).toHaveClass('bg-teradeck-data-science');
    });

    it('should display multicolor module with gradient', () => {
      const card = createMockCard({
        type: CardTypeEnum.MODULE,
        color: 'multicolor' as any,
      });
      render(<Card card={card} />);

      const colorIndicator = screen.getByTitle('multicolor');
      expect(colorIndicator).toHaveClass('bg-gradient-to-r');
      expect(colorIndicator).toHaveClass('animate-shimmer');
    });

    it('should not display color indicator for cards without color', () => {
      const card = createMockCard({ color: undefined });
      render(<Card card={card} />);

      expect(
        screen.queryByTitle(/backend|frontend|mobile|dataScience/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Interaction States', () => {
    it('should show not playable overlay when isPlayable is false', () => {
      const card = createMockCard();
      render(<Card card={card} isPlayable={false} />);

      expect(screen.getByText('Not playable')).toBeInTheDocument();
    });

    it('should apply selected styling when isSelected is true', () => {
      const card = createMockCard();
      render(<Card card={card} isSelected={true} />);

      // Look for the main card container with the ring classes
      const cardElement = document.querySelector('.ring-2.ring-blue-400');
      expect(cardElement).toBeInTheDocument();
    });

    it('should show glow effect when selected', () => {
      const card = createMockCard();
      render(<Card card={card} isSelected={true} />);

      const glowElement = document.querySelector(
        '.bg-gradient-to-r.from-blue-400\\/20'
      );
      expect(glowElement).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const card = createMockCard();
      render(<Card card={card} className="custom-class" />);

      // Look for the custom class in the DOM
      const cardElement = document.querySelector('.custom-class');
      expect(cardElement).toBeInTheDocument();
    });

    it('should apply playable class when playable', () => {
      const card = createMockCard();
      render(<Card card={card} isPlayable={true} />);

      // Look for the playable class in the DOM
      const cardElement = document.querySelector('.playable');
      expect(cardElement).toBeInTheDocument();
    });

    it('should apply not-playable class when not playable', () => {
      const card = createMockCard();
      render(<Card card={card} isPlayable={false} />);

      // Look for the not-playable class in the DOM
      const cardElement = document.querySelector('.not-playable');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Animation Control', () => {
    it('should disable animations when showAnimation is false', () => {
      const card = createMockCard();
      render(<Card card={card} showAnimation={false} />);

      // When showAnimation is false, it should render a div instead of motion.div
      const cardElement = screen.getByText('Test Card').closest('div');
      expect(cardElement).toBeInTheDocument();
    });

    it('should enable animations by default', () => {
      const card = createMockCard();
      render(<Card card={card} />);

      // By default showAnimation should be true
      const cardElement = screen.getByText('Test Card').closest('div');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Type Badge Colors', () => {
    it('should apply correct color for module type badge', () => {
      const card = createMockCard({ type: CardTypeEnum.MODULE });
      render(<Card card={card} />);

      const badge = screen.getByText('Module');
      expect(badge).toHaveClass(
        'bg-green-100',
        'text-green-800',
        'border-green-200'
      );
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

      const badge = screen.getByText('Patch');
      expect(badge).toHaveClass(
        'bg-blue-100',
        'text-blue-800',
        'border-blue-200'
      );
    });

    it('should apply correct color for operation type badge', () => {
      const card = createMockCard({ type: CardTypeEnum.OPERATION });
      render(<Card card={card} />);

      const badge = screen.getByText('Operation');
      expect(badge).toHaveClass(
        'bg-orange-100',
        'text-orange-800',
        'border-orange-200'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have cursor-pointer when playable', () => {
      const card = createMockCard();
      render(<Card card={card} isPlayable={true} />);

      const cardElement = document.querySelector('.cursor-pointer');
      expect(cardElement).toBeInTheDocument();
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
        description: {
          es: 'Descripción en español',
          en: 'Description in English',
        },
      });

      const {
        getCardName,
        getCardDescription,
      } = require('@shared/constants/cards');

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

      const cardElement = screen.getByText('Test Card').closest('div');
      expect(cardElement).toHaveClass('border-l-gray-500');
    });

    it('should handle unknown module color', () => {
      const unknownColorCard = createMockCard({
        type: CardTypeEnum.MODULE,
        color: 'unknown' as any,
      });
      render(<Card card={unknownColorCard} />);

      const colorIndicator = screen.getByTitle('unknown');
      expect(colorIndicator).toHaveClass('bg-gray-400');
    });
  });
});
