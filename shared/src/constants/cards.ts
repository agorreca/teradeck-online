import {
  BugCard,
  Card,
  CardType,
  ModuleCard,
  ModuleColor,
  OperationCard,
  OperationEffect,
  PatchCard,
} from '../types/game';

// Base deck composition according to manual: 68 functional cards
// Modules: 1 multicolor, 5 Backend, 5 Frontend, 5 Mobile, 5 Data Science = 21 cards
// Bugs: 1 multicolor, 4 Backend, 4 Frontend, 4 Mobile, 4 Data Science = 17 cards
// Patches: 4 multicolor, 4 Backend, 4 Frontend, 4 Mobile, 4 Data Science = 20 cards
// Operations: 3 Architect Change, 3 Ace Recruitment, 2 Internal Phishing, 1 End Year Party, 1 Project Swap = 10 cards

export const BASE_MODULES: ModuleCard[] = [
  // Multicolor module (1)
  {
    id: 'module_multicolor_1',
    name: {
      es: 'Módulo Comodín',
      en: 'Wildcard Module',
    },
    description: {
      es: 'Puede reemplazar cualquier tipo de módulo',
      en: 'Can replace any type of module',
    },
    type: CardType.MODULE,
    color: ModuleColor.MULTICOLOR,
    state: 'free' as any,
    bugs: [],
    patches: [],
    isStabilized: false,
  },

  // Backend modules (5)
  ...Array.from(
    { length: 5 },
    (_, i) =>
      ({
        id: `module_backend_${i + 1}`,
        name: {
          es: 'Módulo Backend',
          en: 'Backend Module',
        },
        description: {
          es: 'Servidor y lógica de negocio del proyecto',
          en: 'Server and business logic of the project',
        },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: 'free' as any,
        bugs: [],
        patches: [],
        isStabilized: false,
      }) as ModuleCard
  ),

  // Frontend modules (5)
  ...Array.from(
    { length: 5 },
    (_, i) =>
      ({
        id: `module_frontend_${i + 1}`,
        name: {
          es: 'Módulo Frontend',
          en: 'Frontend Module',
        },
        description: {
          es: 'Interfaz de usuario y experiencia',
          en: 'User interface and experience',
        },
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: 'free' as any,
        bugs: [],
        patches: [],
        isStabilized: false,
      }) as ModuleCard
  ),

  // Mobile modules (5)
  ...Array.from(
    { length: 5 },
    (_, i) =>
      ({
        id: `module_mobile_${i + 1}`,
        name: {
          es: 'Módulo Mobile',
          en: 'Mobile Module',
        },
        description: {
          es: 'Aplicación móvil y responsive',
          en: 'Mobile app and responsive design',
        },
        type: CardType.MODULE,
        color: ModuleColor.MOBILE,
        state: 'free' as any,
        bugs: [],
        patches: [],
        isStabilized: false,
      }) as ModuleCard
  ),

  // Data Science modules (5)
  ...Array.from(
    { length: 5 },
    (_, i) =>
      ({
        id: `module_data_science_${i + 1}`,
        name: {
          es: 'Módulo Data Science',
          en: 'Data Science Module',
        },
        description: {
          es: 'Análisis de datos e inteligencia artificial',
          en: 'Data analysis and artificial intelligence',
        },
        type: CardType.MODULE,
        color: ModuleColor.DATA_SCIENCE,
        state: 'free' as any,
        bugs: [],
        patches: [],
        isStabilized: false,
      }) as ModuleCard
  ),
];

export const BASE_BUGS: BugCard[] = [
  // Multicolor bug (1)
  {
    id: 'bug_multicolor_1',
    name: {
      es: 'Bug Universal',
      en: 'Universal Bug',
    },
    description: {
      es: 'Puede afectar cualquier tipo de módulo',
      en: 'Can affect any type of module',
    },
    type: CardType.BUG,
    color: 'multicolor',
  },

  // Backend bugs (4)
  ...Array.from(
    { length: 4 },
    (_, i) =>
      ({
        id: `bug_backend_${i + 1}`,
        name: {
          es: 'Bug de Backend',
          en: 'Backend Bug',
        },
        description: {
          es: 'Falla en el servidor que afecta el módulo Backend',
          en: 'Server failure that affects the Backend module',
        },
        type: CardType.BUG,
        color: ModuleColor.BACKEND,
      }) as BugCard
  ),

  // Frontend bugs (4)
  ...Array.from(
    { length: 4 },
    (_, i) =>
      ({
        id: `bug_frontend_${i + 1}`,
        name: {
          es: 'Bug de Frontend',
          en: 'Frontend Bug',
        },
        description: {
          es: 'Error de interfaz que afecta el módulo Frontend',
          en: 'Interface error that affects the Frontend module',
        },
        type: CardType.BUG,
        color: ModuleColor.FRONTEND,
      }) as BugCard
  ),

  // Mobile bugs (4)
  ...Array.from(
    { length: 4 },
    (_, i) =>
      ({
        id: `bug_mobile_${i + 1}`,
        name: {
          es: 'Bug de Mobile',
          en: 'Mobile Bug',
        },
        description: {
          es: 'Problema de compatibilidad que afecta el módulo Mobile',
          en: 'Compatibility issue that affects the Mobile module',
        },
        type: CardType.BUG,
        color: ModuleColor.MOBILE,
      }) as BugCard
  ),

  // Data Science bugs (4)
  ...Array.from(
    { length: 4 },
    (_, i) =>
      ({
        id: `bug_data_science_${i + 1}`,
        name: {
          es: 'Bug de Data Science',
          en: 'Data Science Bug',
        },
        description: {
          es: 'Error en el modelo que afecta el módulo Data Science',
          en: 'Model error that affects the Data Science module',
        },
        type: CardType.BUG,
        color: ModuleColor.DATA_SCIENCE,
      }) as BugCard
  ),
];

export const BASE_PATCHES: PatchCard[] = [
  // Multicolor patches (4)
  ...Array.from(
    { length: 4 },
    (_, i) =>
      ({
        id: `patch_multicolor_${i + 1}`,
        name: {
          es: 'Parche Universal',
          en: 'Universal Patch',
        },
        description: {
          es: 'Puede proteger o reparar cualquier tipo de módulo',
          en: 'Can protect or repair any type of module',
        },
        type: CardType.PATCH,
        color: 'multicolor',
      }) as PatchCard
  ),

  // Backend patches (4)
  ...Array.from(
    { length: 4 },
    (_, i) =>
      ({
        id: `patch_backend_${i + 1}`,
        name: {
          es: 'Parche de Backend',
          en: 'Backend Patch',
        },
        description: {
          es: 'Solución que protege o repara el módulo Backend',
          en: 'Solution that protects or repairs the Backend module',
        },
        type: CardType.PATCH,
        color: ModuleColor.BACKEND,
      }) as PatchCard
  ),

  // Frontend patches (4)
  ...Array.from(
    { length: 4 },
    (_, i) =>
      ({
        id: `patch_frontend_${i + 1}`,
        name: {
          es: 'Parche de Frontend',
          en: 'Frontend Patch',
        },
        description: {
          es: 'Update que protege o repara el módulo Frontend',
          en: 'Update that protects or repairs the Frontend module',
        },
        type: CardType.PATCH,
        color: ModuleColor.FRONTEND,
      }) as PatchCard
  ),

  // Mobile patches (4)
  ...Array.from(
    { length: 4 },
    (_, i) =>
      ({
        id: `patch_mobile_${i + 1}`,
        name: {
          es: 'Parche de Mobile',
          en: 'Mobile Patch',
        },
        description: {
          es: 'Hotfix que protege o repara el módulo Mobile',
          en: 'Hotfix that protects or repairs the Mobile module',
        },
        type: CardType.PATCH,
        color: ModuleColor.MOBILE,
      }) as PatchCard
  ),

  // Data Science patches (4)
  ...Array.from(
    { length: 4 },
    (_, i) =>
      ({
        id: `patch_data_science_${i + 1}`,
        name: {
          es: 'Parche de Data Science',
          en: 'Data Science Patch',
        },
        description: {
          es: 'Calibración que protege o repara el módulo Data Science',
          en: 'Calibration that protects or repairs the Data Science module',
        },
        type: CardType.PATCH,
        color: ModuleColor.DATA_SCIENCE,
      }) as PatchCard
  ),
];

export const BASE_OPERATIONS: OperationCard[] = [
  // Architect Change (3)
  ...Array.from(
    { length: 3 },
    (_, i) =>
      ({
        id: `op_architect_change_${i + 1}`,
        name: {
          es: 'Cambio de Arquitecto',
          en: 'Architect Change',
        },
        description: {
          es: 'Dos jugadores intercambian módulos según el nuevo plan',
          en: 'Two players exchange modules according to the new plan',
        },
        type: CardType.OPERATION,
        effect: OperationEffect.ARCHITECT_CHANGE,
      }) as OperationCard
  ),

  // Ace Recruitment (3)
  ...Array.from(
    { length: 3 },
    (_, i) =>
      ({
        id: `op_recruit_ace_${i + 1}`,
        name: {
          es: 'Reclutamiento del Groso',
          en: 'Ace Recruitment',
        },
        description: {
          es: 'Roba un módulo de otro jugador para tu proyecto',
          en: 'Steal a module from another player for your project',
        },
        type: CardType.OPERATION,
        effect: OperationEffect.RECRUIT_ACE,
      }) as OperationCard
  ),

  // Internal Phishing (2)
  ...Array.from(
    { length: 2 },
    (_, i) =>
      ({
        id: `op_internal_phishing_${i + 1}`,
        name: {
          es: 'Phishing Interno',
          en: 'Internal Phishing',
        },
        description: {
          es: 'Propaga bugs de tus módulos a módulos libres de rivales',
          en: 'Spread bugs from your modules to free rival modules',
        },
        type: CardType.OPERATION,
        effect: OperationEffect.INTERNAL_PHISHING,
      }) as OperationCard
  ),

  // End of Year Party (1)
  {
    id: 'op_end_year_party_1',
    name: {
      es: 'Fiesta de Fin de Año',
      en: 'End of Year Party',
    },
    description: {
      es: 'Todos descartan sus manos y pierden el próximo turno',
      en: 'Everyone discards their hands and loses their next turn',
    },
    type: CardType.OPERATION,
    effect: OperationEffect.END_YEAR_PARTY,
  },

  // Project Swap (1)
  {
    id: 'op_project_swap_1',
    name: {
      es: 'Project Swap',
      en: 'Project Swap',
    },
    description: {
      es: 'Intercambia todos tus módulos con los de otro jugador',
      en: 'Exchange all your modules with another player',
    },
    type: CardType.OPERATION,
    effect: OperationEffect.PROJECT_SWAP,
  },
];

// Combine all cards to create the full deck
export const ALL_CARDS: Card[] = [
  ...BASE_MODULES,
  ...BASE_BUGS,
  ...BASE_PATCHES,
  ...BASE_OPERATIONS,
];

// Function to create a shuffled deck
export function createTeraDeckDeck(): Card[] {
  const deck = [...ALL_CARDS];
  return shuffleDeck(deck);
}

// Utility function to shuffle deck (Fisher-Yates algorithm)
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Utility function to get card name in specific language
export function getCardName(card: Card, language: 'es' | 'en'): string {
  return card.name[language] || card.name.es || card.id;
}

// Utility function to get card description in specific language
export function getCardDescription(card: Card, language: 'es' | 'en'): string {
  return card.description[language] || card.description.es || '';
}
