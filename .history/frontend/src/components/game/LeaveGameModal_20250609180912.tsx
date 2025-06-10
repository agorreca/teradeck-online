import { useTranslation } from '../../hooks/useTranslation';
import { Modal } from '../common/Modal';

interface LeaveGameModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  playerCount: number;
  aiCount: number;
}

export function LeaveGameModal({
  isOpen,
  onConfirm,
  onCancel,
  playerCount,
  aiCount,
}: LeaveGameModalProps) {
  const { t } = useTranslation();
  
  const humanPlayers = playerCount - aiCount;
  const willBeEmpty = humanPlayers <= 1;
  const willBeOnlyAI = humanPlayers === 1 && aiCount > 0;

  const getLeaveConsequence = () => {
    if (willBeEmpty) {
      return {
        title: t('game.leaveGame.emptyRoom'),
        description: t('game.leaveGame.emptyRoomDescription'),
        icon: '🏠',
        color: 'text-red-600',
      };
    } else if (willBeOnlyAI) {
      return {
        title: t('game.leaveGame.onlyAI'),
        description: t('game.leaveGame.onlyAIDescription'),
        icon: '🤖',
        color: 'text-orange-600',
      };
    } else {
      return {
        title: t('game.leaveGame.continueWithOthers'),
        description: t('game.leaveGame.continueWithOthersDescription'),
        icon: '👥',
        color: 'text-blue-600',
      };
    }
  };

  const consequence = getLeaveConsequence();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t('game.leaveGame.title')}
      size="md"
    >
      <div className="space-y-4">
        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">
                {t('game.leaveGame.warning')}
              </h3>
              <p className="text-sm text-yellow-700">
                {t('game.leaveGame.cardsToDiscard')}
              </p>
            </div>
          </div>
        </div>

        {/* Consequence */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{consequence.icon}</div>
            <div>
              <h3 className={`font-semibold mb-1 ${consequence.color}`}>
                {consequence.title}
              </h3>
              <p className="text-sm text-gray-600">
                {consequence.description}
              </p>
            </div>
          </div>
        </div>

        {/* Player count info */}
        <div className="text-sm text-gray-500 bg-gray-50 rounded p-3">
          <div className="flex justify-between">
            <span>{t('game.leaveGame.currentPlayers')}</span>
            <span>{humanPlayers} {t('game.leaveGame.humans')} + {aiCount} {t('game.leaveGame.ai')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('game.leaveGame.afterLeaving')}</span>
            <span>{Math.max(0, humanPlayers - 1)} {t('game.leaveGame.humans')} + {aiCount} {t('game.leaveGame.ai')}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {t('game.leaveGame.cancel')}
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
          >
            {t('game.leaveGame.confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
} 