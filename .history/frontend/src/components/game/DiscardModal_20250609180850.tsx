import { useState } from 'react';
import { Card } from '../../../../shared/src/types/game';
import { useTranslation } from '../../hooks/useTranslation';
import { Modal } from '../common/Modal';

interface DiscardModalProps {
  isOpen: boolean;
  cards: Card[];
  onConfirm: (selectedCards: Card[]) => void;
  onCancel: () => void;
}

export function DiscardModal({
  isOpen,
  cards,
  onConfirm,
  onCancel,
}: DiscardModalProps) {
  const { t } = useTranslation();
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const handleCardToggle = (card: Card) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else if (prev.length < 3) {
        return [...prev, card];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    if (selectedCards.length >= 1 && selectedCards.length <= 3) {
      onConfirm(selectedCards);
      setSelectedCards([]);
    }
  };

  const handleCancel = () => {
    setSelectedCards([]);
    onCancel();
  };

  const canConfirm = selectedCards.length >= 1 && selectedCards.length <= 3;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={t('game.selectCardsToDiscard')}
      size="lg"
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          {t('game.discardInstructions')} ({selectedCards.length}/3)
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {cards.map(card => {
            const isSelected = selectedCards.some(c => c.id === card.id);
            const canSelect = !isSelected && selectedCards.length < 3;

            return (
              <button
                key={card.id}
                className={`
                  card card-${card.type} text-left p-3 transition-all duration-200
                  ${
                    isSelected
                      ? 'ring-2 ring-red-500 bg-red-50 shadow-lg'
                      : canSelect
                        ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                  }
                `}
                onClick={() =>
                  (isSelected || canSelect) && handleCardToggle(card)
                }
                disabled={!isSelected && !canSelect}
              >
                <div className="card-header">
                  <div className="card-name text-sm font-semibold">
                    {card.name.es}
                  </div>
                  <div className="card-type text-xs">
                    {t(`ui.cards.${card.type}`)}
                  </div>
                </div>
                <div className="card-description text-xs text-gray-600 mt-2">
                  {card.description.es}
                </div>
                <div className="card-footer mt-2">
                  {card.color && (
                    <div
                      className={`card-color-indicator w-4 h-4 rounded-full ${getModuleColorClass(card.color)}`}
                    />
                  )}
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button className="btn btn-secondary" onClick={handleCancel}>
            {t('game.cancel')}
          </button>
          <button
            className={`btn ${canConfirm ? 'btn-primary' : 'btn-disabled'}`}
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {t('game.confirmDiscard')} ({selectedCards.length})
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Helper function for module colors (could be moved to utils)
function getModuleColorClass(color: string): string {
  const colorMap: { [key: string]: string } = {
    backend: 'bg-blue-500',
    frontend: 'bg-yellow-500',
    mobile: 'bg-red-500',
    dataScience: 'bg-green-500',
    'data-science': 'bg-green-500',
    multicolor:
      'bg-gradient-to-r from-blue-500 via-yellow-500 via-red-500 to-green-500',
  };
  return colorMap[color] || 'bg-gray-500';
}
