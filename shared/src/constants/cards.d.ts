import { BugCard, Card, ModuleCard, OperationCard, PatchCard } from '../types/game';
export declare const BASE_MODULES: ModuleCard[];
export declare const BASE_BUGS: BugCard[];
export declare const BASE_PATCHES: PatchCard[];
export declare const BASE_OPERATIONS: OperationCard[];
export declare const ALL_CARDS: Card[];
export declare function createTeraDeckDeck(): Card[];
export declare function shuffleDeck(deck: Card[]): Card[];
export declare function getCardName(card: Card, language: 'es' | 'en'): string;
export declare function getCardDescription(card: Card, language: 'es' | 'en'): string;
//# sourceMappingURL=cards.d.ts.map