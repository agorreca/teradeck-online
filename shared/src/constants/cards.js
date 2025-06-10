"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_CARDS = exports.BASE_OPERATIONS = exports.BASE_PATCHES = exports.BASE_BUGS = exports.BASE_MODULES = void 0;
exports.createTeraDeckDeck = createTeraDeckDeck;
exports.shuffleDeck = shuffleDeck;
exports.getCardName = getCardName;
exports.getCardDescription = getCardDescription;
const game_1 = require("../types/game");
exports.BASE_MODULES = [
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
        type: game_1.CardType.MODULE,
        color: game_1.ModuleColor.MULTICOLOR,
        state: 'free',
        bugs: [],
        patches: [],
        isStabilized: false,
    },
    ...Array.from({ length: 5 }, (_, i) => ({
        id: `module_backend_${i + 1}`,
        name: {
            es: 'Módulo Backend',
            en: 'Backend Module',
        },
        description: {
            es: 'Servidor y lógica de negocio del proyecto',
            en: 'Server and business logic of the project',
        },
        type: game_1.CardType.MODULE,
        color: game_1.ModuleColor.BACKEND,
        state: 'free',
        bugs: [],
        patches: [],
        isStabilized: false,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
        id: `module_frontend_${i + 1}`,
        name: {
            es: 'Módulo Frontend',
            en: 'Frontend Module',
        },
        description: {
            es: 'Interfaz de usuario y experiencia',
            en: 'User interface and experience',
        },
        type: game_1.CardType.MODULE,
        color: game_1.ModuleColor.FRONTEND,
        state: 'free',
        bugs: [],
        patches: [],
        isStabilized: false,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
        id: `module_mobile_${i + 1}`,
        name: {
            es: 'Módulo Mobile',
            en: 'Mobile Module',
        },
        description: {
            es: 'Aplicación móvil y responsive',
            en: 'Mobile app and responsive design',
        },
        type: game_1.CardType.MODULE,
        color: game_1.ModuleColor.MOBILE,
        state: 'free',
        bugs: [],
        patches: [],
        isStabilized: false,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
        id: `module_data_science_${i + 1}`,
        name: {
            es: 'Módulo Data Science',
            en: 'Data Science Module',
        },
        description: {
            es: 'Análisis de datos e inteligencia artificial',
            en: 'Data analysis and artificial intelligence',
        },
        type: game_1.CardType.MODULE,
        color: game_1.ModuleColor.DATA_SCIENCE,
        state: 'free',
        bugs: [],
        patches: [],
        isStabilized: false,
    })),
];
exports.BASE_BUGS = [
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
        type: game_1.CardType.BUG,
        color: 'multicolor',
    },
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `bug_backend_${i + 1}`,
        name: {
            es: 'Bug de Backend',
            en: 'Backend Bug',
        },
        description: {
            es: 'Falla en el servidor que afecta el módulo Backend',
            en: 'Server failure that affects the Backend module',
        },
        type: game_1.CardType.BUG,
        color: game_1.ModuleColor.BACKEND,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `bug_frontend_${i + 1}`,
        name: {
            es: 'Bug de Frontend',
            en: 'Frontend Bug',
        },
        description: {
            es: 'Error de interfaz que afecta el módulo Frontend',
            en: 'Interface error that affects the Frontend module',
        },
        type: game_1.CardType.BUG,
        color: game_1.ModuleColor.FRONTEND,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `bug_mobile_${i + 1}`,
        name: {
            es: 'Bug de Mobile',
            en: 'Mobile Bug',
        },
        description: {
            es: 'Problema de compatibilidad que afecta el módulo Mobile',
            en: 'Compatibility issue that affects the Mobile module',
        },
        type: game_1.CardType.BUG,
        color: game_1.ModuleColor.MOBILE,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `bug_data_science_${i + 1}`,
        name: {
            es: 'Bug de Data Science',
            en: 'Data Science Bug',
        },
        description: {
            es: 'Error en el modelo que afecta el módulo Data Science',
            en: 'Model error that affects the Data Science module',
        },
        type: game_1.CardType.BUG,
        color: game_1.ModuleColor.DATA_SCIENCE,
    })),
];
exports.BASE_PATCHES = [
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `patch_multicolor_${i + 1}`,
        name: {
            es: 'Parche Universal',
            en: 'Universal Patch',
        },
        description: {
            es: 'Puede proteger o reparar cualquier tipo de módulo',
            en: 'Can protect or repair any type of module',
        },
        type: game_1.CardType.PATCH,
        color: 'multicolor',
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `patch_backend_${i + 1}`,
        name: {
            es: 'Parche de Backend',
            en: 'Backend Patch',
        },
        description: {
            es: 'Solución que protege o repara el módulo Backend',
            en: 'Solution that protects or repairs the Backend module',
        },
        type: game_1.CardType.PATCH,
        color: game_1.ModuleColor.BACKEND,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `patch_frontend_${i + 1}`,
        name: {
            es: 'Parche de Frontend',
            en: 'Frontend Patch',
        },
        description: {
            es: 'Update que protege o repara el módulo Frontend',
            en: 'Update that protects or repairs the Frontend module',
        },
        type: game_1.CardType.PATCH,
        color: game_1.ModuleColor.FRONTEND,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `patch_mobile_${i + 1}`,
        name: {
            es: 'Parche de Mobile',
            en: 'Mobile Patch',
        },
        description: {
            es: 'Hotfix que protege o repara el módulo Mobile',
            en: 'Hotfix that protects or repairs the Mobile module',
        },
        type: game_1.CardType.PATCH,
        color: game_1.ModuleColor.MOBILE,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
        id: `patch_data_science_${i + 1}`,
        name: {
            es: 'Parche de Data Science',
            en: 'Data Science Patch',
        },
        description: {
            es: 'Calibración que protege o repara el módulo Data Science',
            en: 'Calibration that protects or repairs the Data Science module',
        },
        type: game_1.CardType.PATCH,
        color: game_1.ModuleColor.DATA_SCIENCE,
    })),
];
exports.BASE_OPERATIONS = [
    ...Array.from({ length: 3 }, (_, i) => ({
        id: `op_architect_change_${i + 1}`,
        name: {
            es: 'Cambio de Arquitecto',
            en: 'Architect Change',
        },
        description: {
            es: 'Dos jugadores intercambian módulos según el nuevo plan',
            en: 'Two players exchange modules according to the new plan',
        },
        type: game_1.CardType.OPERATION,
        effect: game_1.OperationEffect.ARCHITECT_CHANGE,
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
        id: `op_recruit_ace_${i + 1}`,
        name: {
            es: 'Reclutamiento del Groso',
            en: 'Ace Recruitment',
        },
        description: {
            es: 'Roba un módulo de otro jugador para tu proyecto',
            en: 'Steal a module from another player for your project',
        },
        type: game_1.CardType.OPERATION,
        effect: game_1.OperationEffect.RECRUIT_ACE,
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
        id: `op_internal_phishing_${i + 1}`,
        name: {
            es: 'Phishing Interno',
            en: 'Internal Phishing',
        },
        description: {
            es: 'Propaga bugs de tus módulos a módulos libres de rivales',
            en: 'Spread bugs from your modules to free rival modules',
        },
        type: game_1.CardType.OPERATION,
        effect: game_1.OperationEffect.INTERNAL_PHISHING,
    })),
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
        type: game_1.CardType.OPERATION,
        effect: game_1.OperationEffect.END_YEAR_PARTY,
    },
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
        type: game_1.CardType.OPERATION,
        effect: game_1.OperationEffect.PROJECT_SWAP,
    },
];
exports.ALL_CARDS = [
    ...exports.BASE_MODULES,
    ...exports.BASE_BUGS,
    ...exports.BASE_PATCHES,
    ...exports.BASE_OPERATIONS,
];
function createTeraDeckDeck() {
    const deck = [...exports.ALL_CARDS];
    return shuffleDeck(deck);
}
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function getCardName(card, language) {
    return card.name[language] || card.name.es || card.id;
}
function getCardDescription(card, language) {
    return card.description[language] || card.description.es || '';
}
//# sourceMappingURL=cards.js.map