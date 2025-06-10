import { Card, CardTargetRequirements, GameState, TargetOption } from '../types/game';
export declare const CARD_TARGET_REQUIREMENTS: Record<string, CardTargetRequirements>;
export declare function getCardTargetRequirements(card: Card): CardTargetRequirements;
export declare function cardRequiresTarget(card: Card): boolean;
export declare function getValidTargets(card: Card, gameState: GameState, currentPlayerId: string): TargetOption[];
export declare function validateTargets(card: Card, targets: TargetOption[], gameState: GameState, currentPlayerId: string): {
    isValid: boolean;
    errorKey?: string;
};
//# sourceMappingURL=targeting.d.ts.map