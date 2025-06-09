import { Language } from '../types/game.js';
import { en } from './locales/en.js';
import { es } from './locales/es.js';

export interface Translations {
  // Game UI
  ui: {
    lobby: {
      title: string;
      subtitle: string;
      nickname: string;
      createGame: string;
      joinGame: string;
      roomCode: string;
      creating: string;
      joining: string;
      howToPlay: string;
      instructions: string[];
    };
    game: {
      yourTurn: string;
      waitingTurn: string;
      handCards: string;
      modules: string;
      stableModules: string;
      playCard: string;
      discardCards: string;
      winner: string;
      gameOver: string;
    };
    cards: {
      module: string;
      bug: string;
      patch: string;
      operation: string;
    };
    colors: {
      backend: string;
      frontend: string;
      mobile: string;
      data_science: string;
      multicolor: string;
    };
    states: {
      free: string;
      patched: string;
      bugged: string;
      stabilized: string;
    };
  };

  // Card names and descriptions
  cards: {
    modules: {
      backend: { name: string; description: string };
      frontend: { name: string; description: string };
      mobile: { name: string; description: string };
      data_science: { name: string; description: string };
      multicolor: { name: string; description: string };
    };
    bugs: {
      backend: { name: string; description: string };
      frontend: { name: string; description: string };
      mobile: { name: string; description: string };
      data_science: { name: string; description: string };
      multicolor: { name: string; description: string };
    };
    patches: {
      backend: { name: string; description: string };
      frontend: { name: string; description: string };
      mobile: { name: string; description: string };
      data_science: { name: string; description: string };
      multicolor: { name: string; description: string };
    };
    operations: {
      architect_change: { name: string; description: string };
      recruit_ace: { name: string; description: string };
      internal_phishing: { name: string; description: string };
      end_year_party: { name: string; description: string };
      project_swap: { name: string; description: string };
    };
  };

  // Game actions and messages
  actions: {
    playModule: string;
    playBug: string;
    playPatch: string;
    playOperation: string;
    discard: string;
    passTurn: string;
  };

  // Error messages
  errors: {
    invalidAction: string;
    notYourTurn: string;
    cannotPlaceDuplicate: string;
    invalidTarget: string;
    cardNotInHand: string;
    moduleAlreadyStable: string;
    noValidTargets: string;
  };

  // Targeting system
  targeting: {
    selectTarget: string;
    selectTargets: string;
    confirmTarget: string;
    cancelTargeting: string;
    noValidTargets: string;
    targetRequired: string;
    invalidTarget: string;
    not_enough_targets: string;
    too_many_targets: string;
    targetInstructions: {
      bug: string;
      patch: string;
      operation_architect_change: string;
      operation_internal_phishing: string;
      operation_project_swap: string;
    };
    targetTypes: {
      player: string;
      module: string;
      enemy_player: string;
      enemy_module: string;
      own_module: string;
      bugged_module: string;
      free_module: string;
    };
  };
}

const translations: Record<Language, Translations> = {
  [Language.SPANISH]: es,
  [Language.ENGLISH]: en,
};

export function getTranslations(language: Language): Translations {
  return translations[language] || translations[Language.SPANISH];
}

export function translate(
  language: Language,
  key: string,
  params?: Record<string, any>
): string {
  const t = getTranslations(language);
  const keys = key.split('.');
  let value: any = t;

  for (const k of keys) {
    value = value?.[k];
  }

  if (typeof value !== 'string') {
    return key; // Return key if translation not found
  }

  // Simple parameter replacement
  if (params) {
    return Object.keys(params).reduce((str, param) => {
      return str.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    }, value);
  }

  return value;
}

export { en, es };
