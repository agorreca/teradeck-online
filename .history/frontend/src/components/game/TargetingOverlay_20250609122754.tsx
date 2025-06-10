import {
  GameState,
  TargetingState,
  TargetOption,
  TargetType,
} from '../../../../shared/src/types/game';
import { getCardTargetRequirements } from '../../../../shared/src/utils/targeting';
import { useTranslation } from '../../hooks/useTranslation';

interface TargetingOverlayProps {
  targetingState: TargetingState;
  gameState: GameState;
  currentPlayerId: string;
  selectedTargets: string[]; // Array of target IDs (playerId or moduleId)
  onTargetSelect: (target: TargetOption) => void;
  onConfirm: () => void;
  onCancel: () => void;
  canConfirm: boolean;
}

export function TargetingOverlay({
  targetingState,
  gameState,
  currentPlayerId,
  selectedTargets,
  onTargetSelect,
  onConfirm,
  onCancel,
  canConfirm,
}: TargetingOverlayProps) {
  const { t } = useTranslation();

  if (!targetingState.isActive || !targetingState.cardBeingPlayed) {
    return null;
  }

  const requirements = getCardTargetRequirements(
    targetingState.cardBeingPlayed
  );
  const cardType = targetingState.cardBeingPlayed.type;
  const cardEffect = targetingState.cardBeingPlayed.effect;

  // Get instruction key for translations
  const getInstructionKey = () => {
    if (cardType === 'operation' && cardEffect) {
      return `targeting.targetInstructions.operation`;
    }
    return `targeting.targetInstructions.${cardType}`;
  };

  const isTargetSelected = (target: TargetOption) => {
    const targetId = target.moduleId || target.playerId || '';
    return selectedTargets.includes(targetId);
  };

  const renderPlayerTargets = () => {
    const playerTargets = targetingState.validTargets.filter(
      t => t.type === TargetType.ENEMY_PLAYER || t.type === TargetType.PLAYER
    );

    if (playerTargets.length === 0) return null;

    return (
      <div className="targeting-section">
        <h3 className="targeting-section-title">Jugadores</h3>
        <div className="targeting-players">
          {playerTargets.map((target, index) => (
            <button
              key={`player-${target.playerId}-${index}`}
              className={`targeting-player ${isTargetSelected(target) ? 'selected' : ''} ${!target.isValid ? 'invalid' : ''}`}
              onClick={() => target.isValid && onTargetSelect(target)}
              disabled={!target.isValid}
              title={target.reason}
            >
              <div className="player-info">
                <span className="player-name">{target.playerName}</span>
                <span className="player-type">
                  {t(`targeting.targetTypes.${target.type}`)}
                </span>
              </div>
              {isTargetSelected(target) && (
                <span className="selection-indicator">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderModuleTargets = () => {
    const moduleTargets = targetingState.validTargets.filter(t =>
      t.type.includes('module')
    );

    if (moduleTargets.length === 0) return null;

    // Group modules by player
    const modulesByPlayer = moduleTargets.reduce(
      (acc, target) => {
        const playerId = target.playerId || 'unknown';
        if (!acc[playerId]) {
          acc[playerId] = [];
        }
        acc[playerId].push(target);
        return acc;
      },
      {} as Record<string, TargetOption[]>
    );

    return (
      <div className="targeting-section">
        <h3 className="targeting-section-title">Módulos</h3>
        <div className="targeting-modules">
          {Object.entries(modulesByPlayer).map(([playerId, modules]) => (
            <div key={playerId} className="player-modules">
              <h4 className="player-modules-title">
                {modules[0]?.playerName || 'Unknown Player'}
              </h4>
              <div className="modules-grid">
                {modules.map((target, index) => (
                  <button
                    key={`module-${target.moduleId}-${index}`}
                    className={`targeting-module ${isTargetSelected(target) ? 'selected' : ''} ${!target.isValid ? 'invalid' : ''}`}
                    onClick={() => target.isValid && onTargetSelect(target)}
                    disabled={!target.isValid}
                    title={target.reason}
                  >
                    <div className="module-info">
                      <span className="module-name">{target.moduleName}</span>
                      <span className="module-type">
                        Módulo
                      </span>
                    </div>
                    {isTargetSelected(target) && (
                      <span className="selection-indicator">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="targeting-overlay">
      <div className="targeting-backdrop" onClick={onCancel} />
      <div className="targeting-modal">
        <div className="targeting-header">
          <h2 className="targeting-title">
            {requirements.maxTargets === 1
              ? t('targeting.selectTarget')
              : t('targeting.selectTargets')}
          </h2>
          <button className="targeting-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="targeting-instructions">
          <p>{t(getInstructionKey())}</p>
          {requirements.minTargets > 0 && (
            <p className="targeting-requirements">
              {requirements.minTargets === requirements.maxTargets
                ? `${requirements.minTargets} objetivo${requirements.minTargets > 1 ? 's' : ''} requerido${requirements.minTargets > 1 ? 's' : ''}`
                : `${requirements.minTargets}-${requirements.maxTargets} objetivos requeridos`}
            </p>
          )}
        </div>

        <div className="targeting-content">
          {targetingState.validTargets.length === 0 ? (
            <div className="no-targets">
              <p>{t('targeting.noValidTargets')}</p>
            </div>
          ) : (
            <>
              {renderPlayerTargets()}
              {renderModuleTargets()}
            </>
          )}
        </div>

        <div className="targeting-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            {t('targeting.cancelTargeting')}
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            {t('targeting.confirmTarget')}
          </button>
        </div>
      </div>
    </div>
  );
}
