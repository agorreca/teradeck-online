# 🔌 API Reference - TeraDeck

## Socket.IO Events API

TeraDeck utiliza Socket.IO para comunicación en tiempo real entre cliente y servidor. Todos los eventos están tipados con TypeScript para garantizar type safety.

## 📡 Eventos Cliente → Servidor

### 🏠 Room Management

#### `create-room`

Crea una nueva sala de juego.

```typescript
socket.emit('create-room', settings: RoomSettings);

interface RoomSettings {
  maxPlayers: number;        // 2-6 jugadores
  aiPlayers: number;         // 0-5 jugadores IA
  language: Language;        // 'es' | 'en'
  aiDifficulty: AIDifficulty; // 'easy' | 'normal' | 'hard'
}
```

**Respuesta**: `room-created` o `room-error`

#### `join-room`

Unirse a una sala existente.

```typescript
socket.emit('join-room', code: string, nickname: string);
```

**Parámetros**:

- `code`: Código de 6 caracteres de la sala (ej: "ABC123")
- `nickname`: Nombre del jugador (máx. 20 caracteres)

**Respuesta**: `room-joined` o `room-error`

#### `leave-room`

Abandonar la sala actual.

```typescript
socket.emit('leave-room');
```

**Respuesta**: `room-left`

### 🎮 Game Actions

#### `play-card`

Jugar una carta de la mano.

```typescript
socket.emit('play-card', action: PlayCardAction);

interface PlayCardAction {
  type: ActionType.PLAY_CARD;
  playerId: string;
  data: PlayCardActionData;
}

interface PlayCardActionData {
  card: Card;                    // Carta a jugar
  targetPlayerId?: string;       // Para bugs/parches/operaciones
  targetModuleId?: string;       // Módulo objetivo
  swapTargetPlayerId?: string;   // Para operaciones de intercambio
  swapModuleIds?: string[];      // Para Cambio de Arquitecto
}
```

**Respuesta**: `game-updated` o `game-error`

#### `discard-cards`

Descartar cartas y robar nuevas.

```typescript
socket.emit('discard-cards', action: DiscardCardsAction);

interface DiscardCardsAction {
  type: ActionType.DISCARD_CARDS;
  playerId: string;
  data: DiscardCardsActionData;
}

interface DiscardCardsActionData {
  cards: Card[];  // 1-3 cartas a descartar
}
```

**Respuesta**: `game-updated` o `game-error`

#### `pass-turn`

Pasar turno sin hacer ninguna acción.

```typescript
socket.emit('pass-turn');
```

**Respuesta**: `game-updated` o `game-error`

### 💬 Chat Events (Futuro)

#### `send-message`

Enviar mensaje en el chat de la sala.

```typescript
socket.emit('send-message', message: ChatMessage);

interface ChatMessage {
  playerId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'emote' | 'system';
}
```

## 📨 Eventos Servidor → Cliente

### 🏠 Room Events

#### `room-created`

Confirmación de sala creada exitosamente.

```typescript
socket.on('room-created', (code: string) => {
  // Navegar a /room/{code}
});
```

#### `room-joined`

Confirmación de unión exitosa + estado inicial del juego.

```typescript
socket.on('room-joined', (gameState: GameState) => {
  // Inicializar interfaz del juego
});
```

#### `room-error`

Error en operaciones de sala.

```typescript
socket.on('room-error', (error: RoomError) => {
  // Mostrar error al usuario
});

interface RoomError {
  code: string;
  messageKey: string; // Clave para i18n
  details?: any;
}
```

#### `player-joined`

Nuevo jugador se ha unido.

```typescript
socket.on('player-joined', (player: Player) => {
  // Actualizar lista de jugadores
});
```

#### `player-left`

Un jugador ha abandonado la sala.

```typescript
socket.on('player-left', (playerId: string) => {
  // Remover jugador de la interfaz
});
```

### 🎮 Game Events

#### `game-updated`

El estado del juego ha cambiado.

```typescript
socket.on('game-updated', (gameState: GameState) => {
  // Actualizar toda la interfaz del juego
});
```

#### `game-started`

La partida ha comenzado.

```typescript
socket.on('game-started', (gameState: GameState) => {
  // Cambiar a vista de juego
});
```

#### `game-finished`

La partida ha terminado.

```typescript
socket.on('game-finished', (result: GameResult) => {
  // Mostrar pantalla de victoria/derrota
});

interface GameResult {
  winnerId: string;
  winnerNickname: string;
  finalScores: PlayerScore[];
  gameDuration: number; // en segundos
}
```

#### `turn-changed`

Ha cambiado el turno.

```typescript
socket.on('turn-changed', (turnInfo: TurnInfo) => {
  // Actualizar indicador de turno
});

interface TurnInfo {
  currentPlayerId: string;
  turnNumber: number;
  timeRemaining?: number; // Para turnos con límite de tiempo
}
```

#### `card-played`

Se ha jugado una carta (para animaciones).

```typescript
socket.on('card-played', (cardAction: CardPlayedEvent) => {
  // Ejecutar animación específica
});

interface CardPlayedEvent {
  playerId: string;
  card: Card;
  effect: CardEffect;
  targets?: string[];
}
```

#### `game-error`

Error durante una acción del juego.

```typescript
socket.on('game-error', (error: GameError) => {
  // Mostrar error específico del juego
});

interface GameError {
  code: string;
  messageKey: string;
  playerId?: string;
  actionType?: ActionType;
}
```

## 📊 Data Structures

### 🎯 GameState

Estado completo del juego.

```typescript
interface GameState {
  id: string;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  turn: number;
  deck: Card[];
  discardPile: Card[];
  settings: GameSettings;
  language: Language;
  winner?: string;
  lastAction?: GameAction;
  createdAt: Date;
  updatedAt: Date;
}

enum GameStatus {
  WAITING = 'waiting',
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  FINISHED = 'finished',
}
```

### 👤 Player

Información del jugador.

```typescript
interface Player {
  id: string;
  nickname: string;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  hand: Card[];
  modules: ModuleCard[];
  skippedTurns: number;
  isConnected: boolean;
  joinedAt: Date;
}
```

### 🃏 Card Types

Tipos de cartas del juego.

```typescript
interface Card {
  id: string;
  type: CardType;
  color?: ModuleColor | 'multicolor';
  name: LocalizedText;
  description: LocalizedText;
}

interface ModuleCard extends Card {
  type: CardType.MODULE;
  color: ModuleColor | 'multicolor';
  state: ModuleState;
  bugs: BugCard[];
  patches: PatchCard[];
  isStabilized: boolean;
}

interface BugCard extends Card {
  type: CardType.BUG;
  color: ModuleColor | 'multicolor';
}

interface PatchCard extends Card {
  type: CardType.PATCH;
  color: ModuleColor | 'multicolor';
}

interface OperationCard extends Card {
  type: CardType.OPERATION;
  effect: OperationEffect;
}
```

### 🎲 Game Actions

Acciones que pueden realizar los jugadores.

```typescript
interface GameAction {
  id: string;
  type: ActionType;
  playerId: string;
  data: ActionData;
  timestamp: Date;
}

enum ActionType {
  PLAY_CARD = 'play_card',
  DISCARD_CARDS = 'discard_cards',
  PASS_TURN = 'pass_turn',
}

type ActionData = PlayCardActionData | DiscardCardsActionData;
```

## 🔒 Validation & Errors

### Validation Response

Respuesta estándar de validación.

```typescript
interface PlayValidation {
  isValid: boolean;
  errorKey?: string; // Clave para i18n del error
  details?: any; // Información adicional
}
```

### Error Codes

#### Room Errors

- `ROOM_NOT_FOUND`: Sala no existe
- `ROOM_FULL`: Sala llena
- `INVALID_CODE`: Código de sala inválido
- `NICKNAME_TAKEN`: Nickname ya en uso
- `ALREADY_IN_ROOM`: Ya está en una sala

#### Game Errors

- `NOT_YOUR_TURN`: No es el turno del jugador
- `CARD_NOT_IN_HAND`: Carta no está en la mano
- `INVALID_TARGET`: Objetivo inválido para la carta
- `INVALID_ACTION`: Acción no válida en el contexto actual
- `GAME_NOT_STARTED`: El juego aún no ha empezado
- `PLAYER_SKIPPED_TURN`: Jugador debe saltar este turno

#### Card-Specific Errors

- `CANNOT_PLACE_DUPLICATE`: No se puede colocar módulo duplicado
- `MODULE_ALREADY_STABLE`: Módulo ya está estabilizado
- `INVALID_CARD_TYPE`: Tipo de carta inválido
- `COLOR_MISMATCH`: Color de carta no coincide con objetivo

## 🧪 Testing API

### Mock Events

Para desarrollo y testing.

```typescript
// Simular eventos para testing
socket.emit('__test__', {
  action: 'fast-forward-game',
  gameId: string,
  steps: number,
});

socket.emit('__test__', {
  action: 'set-game-state',
  gameId: string,
  state: Partial<GameState>,
});
```

### Debug Events

Información de debugging (solo desarrollo).

```typescript
socket.on('__debug__', (info: DebugInfo) => {
  console.log('Debug:', info);
});

interface DebugInfo {
  type: 'game-state' | 'action-trace' | 'performance';
  data: any;
  timestamp: Date;
}
```

## 🚀 Rate Limiting

### Límites por Endpoint

| Evento          | Límite | Ventana |
| --------------- | ------ | ------- |
| `create-room`   | 5 req  | 1 min   |
| `join-room`     | 10 req | 1 min   |
| `play-card`     | 30 req | 1 min   |
| `discard-cards` | 30 req | 1 min   |
| `send-message`  | 20 req | 1 min   |

### Rate Limit Response

```typescript
socket.on('rate-limit-exceeded', (info: RateLimitInfo) => {
  // Mostrar mensaje de límite excedido
});

interface RateLimitInfo {
  event: string;
  limit: number;
  window: number; // segundos
  retryAfter: number; // segundos
}
```

## 📱 Mobile Considerations

### Reconnection

Manejo de reconexión para dispositivos móviles.

```typescript
socket.on('reconnect', () => {
  // Solicitar estado actual del juego
  socket.emit('request-game-state');
});

socket.on('game-state-sync', (gameState: GameState) => {
  // Sincronizar estado después de reconexión
});
```

### Reduced Events

Eventos optimizados para conexiones lentas.

```typescript
// Activar modo optimizado
socket.emit('set-reduced-events', true);

// Recibir actualizaciones condensadas
socket.on('game-delta', (delta: GameStateDelta) => {
  // Aplicar solo los cambios
});
```

## 🔮 Future API Extensions

### Tournaments

```typescript
socket.emit('create-tournament', settings: TournamentSettings);
socket.emit('join-tournament', tournamentId: string);
socket.on('tournament-started', (bracket: TournamentBracket) => {});
```

### Spectator Mode

```typescript
socket.emit('spectate-game', gameId: string);
socket.on('spectator-update', (gameView: SpectatorGameState) => {});
```

### Custom Cards

```typescript
socket.emit('create-custom-card', card: CustomCard);
socket.emit('use-card-pack', packId: string);
```

---

Esta API está diseñada para ser extensible y mantener compatibilidad hacia atrás conforme evoluciona el juego.
