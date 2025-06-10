import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GameState,
  OperationCard,
  OperationEffect,
} from '../../../../shared/src/types/game';

interface OperationModalProps {
  isOpen: boolean;
  operationCard: OperationCard | null;
  gameState: GameState;
  currentPlayerId: string;
  onConfirm: (targets: OperationTargets) => void;
  onCancel: () => void;
}

interface OperationTargets {
  targetPlayerId?: string;
  targetModuleId?: string;
  swapTargetPlayerId?: string; // For Project Swap (single target)
  swapPlayerIds?: string[]; // For Architect Change (two players)
  swapModuleIds?: string[];
  bugTransfers?: { playerId: string; moduleId: string }[]; // For Internal Phishing
}

export function OperationModal({
  isOpen,
  operationCard,
  gameState,
  currentPlayerId,
  onConfirm,
  onCancel,
}: OperationModalProps) {
  const { t } = useTranslation();
  const [selectedTargets, setSelectedTargets] = useState<OperationTargets>({});
  const [step, setStep] = useState(1); // For multi-step operations

  if (!isOpen || !operationCard) return null;

  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const otherPlayers = gameState.players.filter(p => p.id !== currentPlayerId);

  // Reset state when modal opens
  const resetSelection = () => {
    setSelectedTargets({});
    setStep(1);
  };

  // Handle different operation types
  const renderOperationContent = () => {
    switch (operationCard.effect) {
      case OperationEffect.RECRUIT_ACE:
        return renderRecruitAce();
      case OperationEffect.ARCHITECT_CHANGE:
        return renderArchitectChange();
      case OperationEffect.PROJECT_SWAP:
        return renderProjectSwap();
      case OperationEffect.INTERNAL_PHISHING:
        return renderInternalPhishing();
      case OperationEffect.END_YEAR_PARTY:
        return renderEndYearParty();
      default:
        return <div>Operación no implementada</div>;
    }
  };

  // Recruit Ace: Select enemy module to steal
  const renderRecruitAce = () => {
    const validModules = otherPlayers.flatMap(player =>
      player.modules
        .filter(module => !module.isStabilized) // Can't steal stabilized modules
        .filter(module => {
          // Check if player can accept this module (no duplicates except multicolor)
          if (module.color === 'multicolor') return true;
          return !currentPlayer?.modules.some(m => m.color === module.color);
        })
        .map(module => ({ player, module }))
    );

    if (validModules.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            {t('operations.noValidModulesToSteal')}
          </p>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {t('operations.selectModuleToSteal')}
        </h3>
        <div className="space-y-4">
          {otherPlayers.map(player => {
            const playerValidModules = validModules.filter(
              vm => vm.player.id === player.id
            );
            if (playerValidModules.length === 0) return null;

            return (
              <div key={player.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{player.nickname}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {playerValidModules.map(({ module }) => (
                    <button
                      key={module.id}
                      className={`card card-module text-left p-3 ${
                        selectedTargets.targetModuleId === module.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() =>
                        setSelectedTargets({
                          targetPlayerId: player.id,
                          targetModuleId: module.id,
                        })
                      }
                    >
                      <div className="font-semibold text-sm">
                        {module.name[gameState.language]}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t(`cards.colors.${module.color}`)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Architect Change: Select any two modules from any players to swap
  const renderArchitectChange = () => {
    const allPlayers = gameState.players;
    const selectedFirstModule = selectedTargets.swapModuleIds?.[0];
    const firstModule = allPlayers
      .flatMap(p => p.modules)
      .find(m => m.id === selectedFirstModule);

    if (step === 1) {
      // Step 1: Select first module (from any player)
      return (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t('operations.selectFirstModule')}
          </h3>
          <div className="space-y-4">
            {allPlayers.map(player => (
              <div key={player.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">
                  {player.id === currentPlayerId ? 'Tú' : player.nickname}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {player.modules.map(module => (
                    <button
                      key={module.id}
                      className={`card card-module text-left p-3 ${
                        selectedFirstModule === module.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedTargets({
                          swapModuleIds: [module.id],
                          swapPlayerIds: [player.id],
                        });
                        setStep(2);
                      }}
                    >
                      <div className="font-semibold text-sm">
                        {module.name[gameState.language]}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t(`cards.colors.${module.color}`)} -{' '}
                        {t(`cards.states.${module.state}`)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // Step 2: Select second module (from any player, but check duplicates)
      return (
        <div>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {t('operations.firstModuleSelected')}{' '}
              <strong>{firstModule?.name[gameState.language]}</strong>
            </p>
          </div>

          <h3 className="text-lg font-semibold mb-4">
            {t('operations.selectSecondModule')}
          </h3>
          <div className="space-y-4">
            {allPlayers.map(player => (
              <div key={player.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">
                  {player.id === currentPlayerId ? 'Tú' : player.nickname}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {player.modules.map(module => {
                    // Can't select the same module
                    if (module.id === selectedFirstModule) {
                      return null;
                    }

                    // Check if swap would create duplicates
                    const firstModuleOwner = allPlayers.find(p =>
                      p.modules.some(m => m.id === selectedFirstModule)
                    );

                    const wouldCreateDuplicate =
                      (module.color !== 'multicolor' &&
                        firstModuleOwner?.modules.some(
                          m =>
                            m.id !== selectedFirstModule &&
                            m.color === module.color
                        )) ||
                      (firstModule?.color !== 'multicolor' &&
                        player.modules.some(
                          m =>
                            m.id !== module.id && m.color === firstModule.color
                        ));

                    return (
                      <button
                        key={module.id}
                        className={`card card-module text-left p-3 ${
                          wouldCreateDuplicate
                            ? 'opacity-50 cursor-not-allowed'
                            : selectedTargets.swapModuleIds?.[1] === module.id
                              ? 'ring-2 ring-blue-500 bg-blue-50'
                              : 'hover:bg-gray-50'
                        }`}
                        disabled={wouldCreateDuplicate}
                        onClick={() =>
                          !wouldCreateDuplicate &&
                          setSelectedTargets(prev => ({
                            ...prev,
                            swapPlayerIds: [prev.swapPlayerIds![0], player.id],
                            swapModuleIds: [selectedFirstModule!, module.id],
                          }))
                        }
                      >
                        <div className="font-semibold text-sm">
                          {module.name[gameState.language]}
                        </div>
                        <div className="text-xs text-gray-600">
                          {t(`cards.colors.${module.color}`)} -{' '}
                          {t(`cards.states.${module.state}`)}
                        </div>
                        {wouldCreateDuplicate && (
                          <div className="text-xs text-red-600 mt-1">
                            {t('operations.wouldCreateDuplicate')}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => {
              setStep(1);
              setSelectedTargets({});
            }}
          >
            ← {t('operations.goBack')}
          </button>
        </div>
      );
    }
  };

  // Project Swap: Select player to swap all modules with
  const renderProjectSwap = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Selecciona jugador para intercambiar proyectos
      </h3>
      <div className="space-y-3">
        {otherPlayers.map(player => (
          <button
            key={player.id}
            className={`w-full text-left p-4 border rounded-lg ${
              selectedTargets.swapTargetPlayerId === player.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() =>
              setSelectedTargets({ swapTargetPlayerId: player.id })
            }
          >
            <div className="font-semibold">{player.nickname}</div>
            <div className="text-sm text-gray-600">
              {player.modules.length} módulos
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Internal Phishing: Transfer all your bugs to free modules of other players
  const renderInternalPhishing = () => {
    // Get all your bugs from your modules
    const yourBugs =
      currentPlayer?.modules.flatMap(module =>
        module.bugs.map(bug => ({ bug, sourceModule: module }))
      ) || [];

    // Get all free modules from other players that can accept bugs
    const validTargetsForBugs = yourBugs.map(({ bug }) => {
      return otherPlayers.flatMap(player =>
        player.modules
          .filter(
            module =>
              module.state === 'free' &&
              (bug.color === 'multicolor' || bug.color === module.color)
          )
          .map(module => ({ player, module, bugColor: bug.color }))
      );
    });

    if (yourBugs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            No tienes bugs en tus módulos para transferir
          </p>
        </div>
      );
    }

    const hasValidTargets = validTargetsForBugs.some(
      targets => targets.length > 0
    );

    if (!hasValidTargets) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            No hay módulos libres compatibles en los oponentes
          </p>
          <p className="text-sm text-gray-500">
            Los bugs permanecerán en tus módulos
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">
            Bugs a transferir ({yourBugs.length}):
          </h4>
          <div className="grid grid-cols-1 gap-1">
            {yourBugs.map(({ bug, sourceModule }, index) => (
              <div key={index} className="text-sm">
                <strong>{bug.name[gameState.language]}</strong>
                <span className="text-gray-600">
                  ({t(`cards.colors.${bug.color}`)}) de{' '}
                  {sourceModule.name[gameState.language]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">
          Asigna destino para cada bug:
        </h3>

        {yourBugs.map(({ bug, sourceModule }, bugIndex) => {
          const validTargetsForThisBug = validTargetsForBugs[bugIndex];
          const selectedTargetForThisBug =
            selectedTargets.bugTransfers?.[bugIndex]?.moduleId;

          return (
            <div key={bugIndex} className="mb-6 border-l-4 border-red-400 pl-4">
              <h4 className="font-semibold mb-3 text-red-700">
                Bug #{bugIndex + 1}: {bug.name[gameState.language]}
                <span className="text-sm text-gray-600">
                  ({t(`cards.colors.${bug.color}`)})
                </span>
              </h4>

              {validTargetsForThisBug.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No hay módulos compatibles. Este bug permanecerá donde está.
                </p>
              ) : (
                <div className="space-y-3">
                  {otherPlayers.map(player => {
                    const validModulesForThisBug =
                      validTargetsForThisBug.filter(
                        target => target.player.id === player.id
                      );

                    if (validModulesForThisBug.length === 0) return null;

                    return (
                      <div key={player.id} className="border rounded-lg p-3">
                        <h5 className="font-semibold text-sm mb-2">
                          {player.nickname}
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                          {validModulesForThisBug.map(({ module }) => (
                            <button
                              key={module.id}
                              className={`card card-module text-left p-2 text-xs ${
                                selectedTargetForThisBug === module.id
                                  ? 'ring-2 ring-red-500 bg-red-50'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => {
                                const bugTransfers = [
                                  ...(selectedTargets.bugTransfers || []),
                                ];
                                bugTransfers[bugIndex] = {
                                  playerId: player.id,
                                  moduleId: module.id,
                                };
                                setSelectedTargets(prev => ({
                                  ...prev,
                                  bugTransfers,
                                }));
                              }}
                            >
                              <div className="font-semibold">
                                {module.name[gameState.language]}
                              </div>
                              <div className="text-gray-600">
                                {t(`cards.colors.${module.color}`)} -{' '}
                                {t(`cards.states.${module.state}`)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            💡 Los bugs que no tengan destino válido permanecerán en tus
            módulos.
          </p>
        </div>
      </div>
    );
  };

  // End Year Party: No targeting needed
  const renderEndYearParty = () => (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold mb-4">🎉 Fiesta de Fin de Año</h3>
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h4 className="font-semibold text-purple-800 mb-2">Efectos:</h4>
        <ul className="text-left text-sm text-purple-700 space-y-1">
          <li>
            ✅ <strong>Tú:</strong> Puedes jugar de nuevo inmediatamente después
            de esta carta
          </li>
          <li>
            ❌ <strong>Otros jugadores:</strong> Descartan toda su mano y
            pierden el próximo turno
          </li>
          <li>🔄 Después de tu turno extra, todos vuelven a tener 3 cartas</li>
        </ul>
      </div>
      <p className="text-sm text-gray-500">
        Esta operación se ejecuta inmediatamente sin necesidad de seleccionar
        objetivos.
      </p>
    </div>
  );

  // Check if we can confirm the operation
  const canConfirm = () => {
    switch (operationCard.effect) {
      case OperationEffect.RECRUIT_ACE:
        return selectedTargets.targetPlayerId && selectedTargets.targetModuleId;
      case OperationEffect.ARCHITECT_CHANGE:
        return (
          selectedTargets.swapModuleIds &&
          selectedTargets.swapModuleIds.length === 2 &&
          selectedTargets.swapPlayerIds &&
          selectedTargets.swapPlayerIds.length === 2
        );
      case OperationEffect.PROJECT_SWAP:
        return selectedTargets.swapTargetPlayerId;
      case OperationEffect.INTERNAL_PHISHING:
        // For Internal Phishing, we can execute even if not all bugs have targets
        // (the bugs without valid targets will stay where they are)
        return true;
      case OperationEffect.END_YEAR_PARTY:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <h2 className="text-xl font-bold">
            {operationCard.name[gameState.language]}
          </h2>
          <button
            onClick={() => {
              resetSelection();
              onCancel();
            }}
            className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-orange-50 border-b border-gray-200">
          <p className="text-gray-700 mb-2">
            {operationCard.description[gameState.language]}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {renderOperationContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              resetSelection();
              onCancel();
            }}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {t('game.cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm(selectedTargets);
              resetSelection();
            }}
            disabled={!canConfirm()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('operations.executeOperation')}
          </button>
        </div>
      </div>
    </div>
  );
}
