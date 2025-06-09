import { Translations } from '../index.js';

export const en: Translations = {
  ui: {
    lobby: {
      title: '🎴 TeraDeck Online',
      subtitle: 'Multiplayer card game',
      nickname: 'Your Nickname:',
      createGame: '🎮 Create New Game',
      joinGame: '🚪 Join Game',
      roomCode: 'Room Code:',
      creating: 'Creating...',
      joining: 'Joining...',
      howToPlay: 'How to play?',
      instructions: [
        'Create a new game or join with a code',
        'Complete your project with 4 stable modules',
        'Sabotage your rivals with bugs and operations!',
      ],
    },
    game: {
      yourTurn: 'Your turn',
      waitingTurn: 'Waiting for turn...',
      handCards: 'Hand cards',
      modules: 'Modules',
      stableModules: 'Stable modules',
      playCard: 'Play card',
      discardCards: 'Discard cards',
      winner: 'Winner!',
      gameOver: 'Game over',
    },
    cards: {
      module: 'Module',
      bug: 'Bug',
      patch: 'Patch',
      operation: 'Operation',
    },
    colors: {
      backend: 'Backend',
      frontend: 'Frontend',
      mobile: 'Mobile',
      data_science: 'Data Science',
      multicolor: 'Multicolor',
    },
    states: {
      free: 'Free',
      patched: 'Patched',
      bugged: 'Bugged',
      stabilized: 'Stabilized',
    },
  },

  cards: {
    modules: {
      backend: {
        name: 'Backend Module',
        description: 'Server and business logic of the project',
      },
      frontend: {
        name: 'Frontend Module',
        description: 'User interface and experience',
      },
      mobile: {
        name: 'Mobile Module',
        description: 'Mobile app and responsive design',
      },
      data_science: {
        name: 'Data Science Module',
        description: 'Data analysis and artificial intelligence',
      },
      multicolor: {
        name: 'Wildcard Module',
        description: 'Can replace any type of module',
      },
    },
    bugs: {
      backend: {
        name: 'Backend Bug',
        description: 'Server failure that affects the Backend module',
      },
      frontend: {
        name: 'Frontend Bug',
        description: 'Interface error that affects the Frontend module',
      },
      mobile: {
        name: 'Mobile Bug',
        description: 'Compatibility issue that affects the Mobile module',
      },
      data_science: {
        name: 'Data Science Bug',
        description: 'Model error that affects the Data Science module',
      },
      multicolor: {
        name: 'Universal Bug',
        description: 'Can affect any type of module',
      },
    },
    patches: {
      backend: {
        name: 'Backend Patch',
        description: 'Solution that protects or repairs the Backend module',
      },
      frontend: {
        name: 'Frontend Patch',
        description: 'Update that protects or repairs the Frontend module',
      },
      mobile: {
        name: 'Mobile Patch',
        description: 'Hotfix that protects or repairs the Mobile module',
      },
      data_science: {
        name: 'Data Science Patch',
        description:
          'Calibration that protects or repairs the Data Science module',
      },
      multicolor: {
        name: 'Universal Patch',
        description: 'Can protect or repair any type of module',
      },
    },
    operations: {
      architect_change: {
        name: 'Architect Change',
        description: 'Two players exchange modules according to the new plan',
      },
      recruit_ace: {
        name: 'Ace Recruitment',
        description: 'Steal a module from another player for your project',
      },
      internal_phishing: {
        name: 'Internal Phishing',
        description: 'Spread bugs from your modules to free rival modules',
      },
      end_year_party: {
        name: 'End of Year Party',
        description: 'Everyone discards their hands and loses their next turn',
      },
      project_swap: {
        name: 'Project Swap',
        description: 'Exchange all your modules with another player',
      },
    },
  },

  actions: {
    playModule: 'Place module',
    playBug: 'Apply bug',
    playPatch: 'Apply patch',
    playOperation: 'Execute operation',
    discard: 'Discard',
    passTurn: 'Pass turn',
  },

  errors: {
    invalidAction: 'Invalid action',
    notYourTurn: 'Not your turn',
    cannotPlaceDuplicate: 'Cannot have two modules of the same type',
    invalidTarget: 'Invalid target for this card',
    cardNotInHand: 'This card is not in your hand',
    moduleAlreadyStable: 'This module is already stabilized',
    noValidTargets: 'No valid targets for this card',
  },

  targeting: {
    selectTarget: 'Select a target',
    selectTargets: 'Select targets',
    confirmTarget: 'Confirm target',
    cancelTargeting: 'Cancel',
    noValidTargets: 'No valid targets available',
    targetRequired: 'You must select a target',
    invalidTarget: 'Invalid target',
    not_enough_targets: "You haven't selected enough targets",
    too_many_targets: 'You have selected too many targets',
    targetInstructions: {
      bug: 'Select an enemy module to infect with this bug',
      patch: 'Select one of your modules to protect with this patch',
      operation_architect_change: 'Select an enemy player to swap hands with',
      operation_internal_phishing:
        'Select an enemy player to steal a card from',
      operation_project_swap: 'Select an enemy player to swap modules with',
    },
    targetTypes: {
      player: 'Player',
      module: 'Module',
      enemy_player: 'Enemy player',
      enemy_module: 'Enemy module',
      own_module: 'Your module',
      bugged_module: 'Bugged module',
      free_module: 'Free module',
    },
  },
};
