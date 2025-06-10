"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetType = exports.ActionType = exports.AIDifficulty = exports.Language = exports.GameStatus = exports.OperationEffect = exports.ModuleState = exports.ModuleColor = exports.CardType = void 0;
var CardType;
(function (CardType) {
    CardType["MODULE"] = "module";
    CardType["BUG"] = "bug";
    CardType["PATCH"] = "patch";
    CardType["OPERATION"] = "operation";
})(CardType || (exports.CardType = CardType = {}));
var ModuleColor;
(function (ModuleColor) {
    ModuleColor["BACKEND"] = "backend";
    ModuleColor["FRONTEND"] = "frontend";
    ModuleColor["MOBILE"] = "mobile";
    ModuleColor["DATA_SCIENCE"] = "data_science";
    ModuleColor["MULTICOLOR"] = "multicolor";
})(ModuleColor || (exports.ModuleColor = ModuleColor = {}));
var ModuleState;
(function (ModuleState) {
    ModuleState["FREE"] = "free";
    ModuleState["PATCHED"] = "patched";
    ModuleState["BUGGED"] = "bugged";
    ModuleState["STABILIZED"] = "stabilized";
})(ModuleState || (exports.ModuleState = ModuleState = {}));
var OperationEffect;
(function (OperationEffect) {
    OperationEffect["ARCHITECT_CHANGE"] = "architect_change";
    OperationEffect["RECRUIT_ACE"] = "recruit_ace";
    OperationEffect["INTERNAL_PHISHING"] = "internal_phishing";
    OperationEffect["END_YEAR_PARTY"] = "end_year_party";
    OperationEffect["PROJECT_SWAP"] = "project_swap";
})(OperationEffect || (exports.OperationEffect = OperationEffect = {}));
var GameStatus;
(function (GameStatus) {
    GameStatus["WAITING"] = "waiting";
    GameStatus["IN_PROGRESS"] = "in_progress";
    GameStatus["FINISHED"] = "finished";
    GameStatus["PAUSED"] = "paused";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
var Language;
(function (Language) {
    Language["SPANISH"] = "es";
    Language["ENGLISH"] = "en";
})(Language || (exports.Language = Language = {}));
var AIDifficulty;
(function (AIDifficulty) {
    AIDifficulty["EASY"] = "easy";
    AIDifficulty["NORMAL"] = "normal";
    AIDifficulty["HARD"] = "hard";
})(AIDifficulty || (exports.AIDifficulty = AIDifficulty = {}));
var ActionType;
(function (ActionType) {
    ActionType["PLAY_CARD"] = "play_card";
    ActionType["DISCARD_CARDS"] = "discard_cards";
    ActionType["DRAW_CARDS"] = "draw_cards";
    ActionType["PASS_TURN"] = "pass_turn";
})(ActionType || (exports.ActionType = ActionType = {}));
var TargetType;
(function (TargetType) {
    TargetType["NONE"] = "none";
    TargetType["PLAYER"] = "player";
    TargetType["MODULE"] = "module";
    TargetType["ENEMY_PLAYER"] = "enemy_player";
    TargetType["ENEMY_MODULE"] = "enemy_module";
    TargetType["OWN_MODULE"] = "own_module";
    TargetType["BUGGED_MODULE"] = "bugged_module";
    TargetType["FREE_MODULE"] = "free_module";
    TargetType["ANY_MODULE"] = "any_module";
})(TargetType || (exports.TargetType = TargetType = {}));
//# sourceMappingURL=game.js.map