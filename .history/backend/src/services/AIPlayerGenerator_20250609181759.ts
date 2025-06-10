import { v4 as uuidv4 } from 'uuid';
import { AIDifficulty, Player } from '../../../shared/src/types/game';

export interface AIPersonality {
  name: string;
  preferredDifficulty: AIDifficulty;
  description: {
    es: string;
    en: string;
  };
  traits: {
    aggressive: number; // 0-100, how likely to attack opponents
    defensive: number; // 0-100, how likely to protect own modules
    opportunistic: number; // 0-100, how likely to use special cards
    methodical: number; // 0-100, how planned their strategy is
  };
}

// Predefined AI personalities with TeraDeck-themed names
const AI_PERSONALITIES: AIPersonality[] = [
  {
    name: 'DevBot Jr.',
    preferredDifficulty: AIDifficulty.EASY,
    description: {
      es: 'Un desarrollador novato que está aprendiendo. Hace movimientos básicos y a veces impredecibles.',
      en: 'A novice developer who is learning. Makes basic and sometimes unpredictable moves.',
    },
    traits: {
      aggressive: 30,
      defensive: 20,
      opportunistic: 40,
      methodical: 10,
    },
  },
  {
    name: 'CodeCrafter',
    preferredDifficulty: AIDifficulty.NORMAL,
    description: {
      es: 'Un programador competente que balancea ataque y defensa. Conoce las reglas bien.',
      en: 'A competent programmer who balances attack and defense. Knows the rules well.',
    },
    traits: {
      aggressive: 50,
      defensive: 60,
      opportunistic: 55,
      methodical: 70,
    },
  },
  {
    name: 'BugHunter',
    preferredDifficulty: AIDifficulty.NORMAL,
    description: {
      es: 'Especialista en encontrar y explotar vulnerabilidades. Le gusta sabotear a los oponentes.',
      en: 'Specialist in finding and exploiting vulnerabilities. Likes to sabotage opponents.',
    },
    traits: {
      aggressive: 80,
      defensive: 40,
      opportunistic: 70,
      methodical: 60,
    },
  },
  {
    name: 'ArchMaster',
    preferredDifficulty: AIDifficulty.HARD,
    description: {
      es: 'Arquitecto de software experimentado. Planifica estrategias complejas y anticipa movimientos.',
      en: 'Experienced software architect. Plans complex strategies and anticipates moves.',
    },
    traits: {
      aggressive: 60,
      defensive: 80,
      opportunistic: 85,
      methodical: 95,
    },
  },
  {
    name: 'SysAdmin',
    preferredDifficulty: AIDifficulty.HARD,
    description: {
      es: 'Administrador de sistemas veterano. Prioriza la estabilidad y bloquea amenazas eficientemente.',
      en: 'Veteran system administrator. Prioritizes stability and efficiently blocks threats.',
    },
    traits: {
      aggressive: 40,
      defensive: 95,
      opportunistic: 60,
      methodical: 90,
    },
  },
  {
    name: 'DataNinja',
    preferredDifficulty: AIDifficulty.HARD,
    description: {
      es: 'Científico de datos sigiloso. Usa operaciones especiales de manera muy efective.',
      en: 'Stealthy data scientist. Uses special operations very effectively.',
    },
    traits: {
      aggressive: 70,
      defensive: 50,
      opportunistic: 95,
      methodical: 80,
    },
  },
  {
    name: 'FrontendFox',
    preferredDifficulty: AIDifficulty.NORMAL,
    description: {
      es: 'Desarrollador frontend ágil. Rápido para adaptarse pero a veces impaciente.',
      en: 'Agile frontend developer. Quick to adapt but sometimes impatient.',
    },
    traits: {
      aggressive: 60,
      defensive: 30,
      opportunistic: 80,
      methodical: 40,
    },
  },
  {
    name: 'BackendBear',
    preferredDifficulty: AIDifficulty.NORMAL,
    description: {
      es: 'Desarrollador backend sólido. Construye bases fuertes y se defiende bien.',
      en: 'Solid backend developer. Builds strong foundations and defends well.',
    },
    traits: {
      aggressive: 40,
      defensive: 80,
      opportunistic: 50,
      methodical: 85,
    },
  },
  {
    name: 'MobileMonkey',
    preferredDifficulty: AIDifficulty.EASY,
    description: {
      es: 'Desarrollador mobile energético. Hace muchos movimientos pero no siempre los mejores.',
      en: 'Energetic mobile developer. Makes many moves but not always the best ones.',
    },
    traits: {
      aggressive: 70,
      defensive: 20,
      opportunistic: 90,
      methodical: 30,
    },
  },
  {
    name: 'QualityQueen',
    preferredDifficulty: AIDifficulty.HARD,
    description: {
      es: 'Especialista en QA meticulosa. Previene bugs y optimiza cada movimiento.',
      en: 'Meticulous QA specialist. Prevents bugs and optimizes every move.',
    },
    traits: {
      aggressive: 30,
      defensive: 90,
      opportunistic: 60,
      methodical: 100,
    },
  },
];

export class AIPlayerGenerator {
  private usedPersonalities: Set<string> = new Set();

  /**
   * Generates an AI player with a random personality
   */
  generateAIPlayer(difficulty?: AIDifficulty): Player {
    const personality = this.selectPersonality(difficulty);

    return {
      id: uuidv4(),
      nickname: personality.name,
      isAI: true,
      isHost: false,
      isConnected: true,
      hand: [],
      modules: [],
      skippedTurns: 0,
    };
  }

  /**
   * Generates multiple AI players ensuring personality diversity
   */
  generateAIPlayers(count: number, difficulty?: AIDifficulty): Player[] {
    const players: Player[] = [];
    this.usedPersonalities.clear();

    for (let i = 0; i < count; i++) {
      const aiPlayer = this.generateAIPlayer(difficulty);
      players.push(aiPlayer);
    }

    return players;
  }

  /**
   * Selects an appropriate personality based on difficulty preference
   */
  private selectPersonality(preferredDifficulty?: AIDifficulty): AIPersonality {
    let availablePersonalities = AI_PERSONALITIES.filter(
      p => !this.usedPersonalities.has(p.name)
    );

    // If all personalities are used, reset and allow reuse
    if (availablePersonalities.length === 0) {
      this.usedPersonalities.clear();
      availablePersonalities = AI_PERSONALITIES;
    }

    // Filter by difficulty if specified
    if (preferredDifficulty) {
      const filteredByDifficulty = availablePersonalities.filter(
        p => p.preferredDifficulty === preferredDifficulty
      );

      if (filteredByDifficulty.length > 0) {
        availablePersonalities = filteredByDifficulty;
      }
    }

    // Random selection from available personalities
    const selectedPersonality =
      availablePersonalities[
        Math.floor(Math.random() * availablePersonalities.length)
      ];

    this.usedPersonalities.add(selectedPersonality.name);
    return selectedPersonality;
  }

  /**
   * Gets personality information for a specific AI player
   */
  getPersonalityByName(name: string): AIPersonality | null {
    return AI_PERSONALITIES.find(p => p.name === name) || null;
  }

  /**
   * Gets all available personalities
   */
  getAllPersonalities(): AIPersonality[] {
    return [...AI_PERSONALITIES];
  }

  /**
   * Gets personalities filtered by difficulty
   */
  getPersonalitiesByDifficulty(difficulty: AIDifficulty): AIPersonality[] {
    return AI_PERSONALITIES.filter(p => p.preferredDifficulty === difficulty);
  }

  /**
   * Resets the used personalities tracker
   */
  resetUsedPersonalities(): void {
    this.usedPersonalities.clear();
  }

  /**
   * Creates a custom AI player with specific parameters
   */
  createCustomAIPlayer(
    name: string,
    _difficulty: AIDifficulty,
    _traits?: Partial<AIPersonality['traits']>
  ): Player {
    return {
      id: uuidv4(),
      nickname: name,
      isAI: true,
      isHost: false,
      isConnected: true,
      hand: [],
      modules: [],
      skippedTurns: 0,
    };
  }
}
