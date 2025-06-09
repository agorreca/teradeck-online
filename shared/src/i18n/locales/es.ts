import { Translations } from '../index.js';

export const es: Translations = {
  ui: {
    lobby: {
      title: '🎴 TeraDeck Online',
      subtitle: 'Juego de cartas multijugador',
      nickname: 'Tu Nickname:',
      createGame: '🎮 Crear Nueva Partida',
      joinGame: '🚪 Unirse a Partida',
      roomCode: 'Código de Sala:',
      creating: 'Creando...',
      joining: 'Uniéndose...',
      howToPlay: '¿Cómo jugar?',
      instructions: [
        'Crea una nueva partida o únete con un código',
        'Completa tu proyecto con 4 módulos estables',
        '¡Sabotea a tus rivales con bugs y operaciones!',
      ],
    },
    game: {
      yourTurn: 'Es tu turno',
      waitingTurn: 'Esperando turno...',
      handCards: 'Cartas en mano',
      modules: 'Módulos',
      stableModules: 'Módulos estables',
      playCard: 'Jugar carta',
      discardCards: 'Descartar cartas',
      winner: '¡Ganador!',
      gameOver: 'Juego terminado',
    },
    cards: {
      module: 'Módulo',
      bug: 'Bug',
      patch: 'Parche',
      operation: 'Operación',
    },
    colors: {
      backend: 'Backend',
      frontend: 'Frontend',
      mobile: 'Mobile',
      data_science: 'Data Science',
      multicolor: 'Multicolor',
    },
    states: {
      free: 'Libre',
      patched: 'Parcheado',
      bugged: 'Buggeado',
      stabilized: 'Estabilizado',
    },
  },

  cards: {
    modules: {
      backend: {
        name: 'Módulo Backend',
        description: 'Servidor y lógica de negocio del proyecto',
      },
      frontend: {
        name: 'Módulo Frontend',
        description: 'Interfaz de usuario y experiencia',
      },
      mobile: {
        name: 'Módulo Mobile',
        description: 'Aplicación móvil y responsive',
      },
      data_science: {
        name: 'Módulo Data Science',
        description: 'Análisis de datos e inteligencia artificial',
      },
      multicolor: {
        name: 'Módulo Comodín',
        description: 'Puede reemplazar cualquier tipo de módulo',
      },
    },
    bugs: {
      backend: {
        name: 'Bug de Backend',
        description: 'Falla en el servidor que afecta el módulo Backend',
      },
      frontend: {
        name: 'Bug de Frontend',
        description: 'Error de interfaz que afecta el módulo Frontend',
      },
      mobile: {
        name: 'Bug de Mobile',
        description: 'Problema de compatibilidad que afecta el módulo Mobile',
      },
      data_science: {
        name: 'Bug de Data Science',
        description: 'Error en el modelo que afecta el módulo Data Science',
      },
      multicolor: {
        name: 'Bug Universal',
        description: 'Puede afectar cualquier tipo de módulo',
      },
    },
    patches: {
      backend: {
        name: 'Parche de Backend',
        description: 'Solución que protege o repara el módulo Backend',
      },
      frontend: {
        name: 'Parche de Frontend',
        description: 'Update que protege o repara el módulo Frontend',
      },
      mobile: {
        name: 'Parche de Mobile',
        description: 'Hotfix que protege o repara el módulo Mobile',
      },
      data_science: {
        name: 'Parche de Data Science',
        description: 'Calibración que protege o repara el módulo Data Science',
      },
      multicolor: {
        name: 'Parche Universal',
        description: 'Puede proteger o reparar cualquier tipo de módulo',
      },
    },
    operations: {
      architect_change: {
        name: 'Cambio de Arquitecto',
        description: 'Dos jugadores intercambian módulos según el nuevo plan',
      },
      recruit_ace: {
        name: 'Reclutamiento del Groso',
        description: 'Roba un módulo de otro jugador para tu proyecto',
      },
      internal_phishing: {
        name: 'Phishing Interno',
        description: 'Propaga bugs de tus módulos a módulos libres de rivales',
      },
      end_year_party: {
        name: 'Fiesta de Fin de Año',
        description: 'Todos descartan sus manos y pierden el próximo turno',
      },
      project_swap: {
        name: 'Project Swap',
        description: 'Intercambia todos tus módulos con los de otro jugador',
      },
    },
  },

  actions: {
    playModule: 'Colocar módulo',
    playBug: 'Aplicar bug',
    playPatch: 'Aplicar parche',
    playOperation: 'Ejecutar operación',
    discard: 'Descartar',
    passTurn: 'Pasar turno',
  },

  errors: {
    invalidAction: 'Acción inválida',
    notYourTurn: 'No es tu turno',
    cannotPlaceDuplicate: 'No puedes tener dos módulos del mismo tipo',
    invalidTarget: 'Objetivo inválido para esta carta',
    cardNotInHand: 'Esta carta no está en tu mano',
    moduleAlreadyStable: 'Este módulo ya está estabilizado',
    noValidTargets: 'No hay objetivos válidos para esta carta',
  },

  targeting: {
    selectTarget: 'Selecciona un objetivo',
    selectTargets: 'Selecciona objetivos',
    confirmTarget: 'Confirmar objetivo',
    cancelTargeting: 'Cancelar',
    noValidTargets: 'No hay objetivos válidos',
    targetRequired: 'Debes seleccionar un objetivo',
    invalidTarget: 'Objetivo inválido',
    not_enough_targets: 'No has seleccionado suficientes objetivos',
    too_many_targets: 'Has seleccionado demasiados objetivos',
    targetInstructions: {
      bug: 'Selecciona un módulo enemigo para infectar con este bug',
      patch: 'Selecciona uno de tus módulos para proteger con este parche',
      operation_architect_change:
        'Selecciona un jugador enemigo para intercambiar manos',
      operation_internal_phishing:
        'Selecciona un jugador enemigo para robar una carta',
      operation_project_swap:
        'Selecciona un jugador enemigo para intercambiar módulos',
    },
    targetTypes: {
      player: 'Jugador',
      module: 'Módulo',
      enemy_player: 'Jugador enemigo',
      enemy_module: 'Módulo enemigo',
      own_module: 'Tu módulo',
      bugged_module: 'Módulo buggeado',
      free_module: 'Módulo libre',
    },
  },
};
