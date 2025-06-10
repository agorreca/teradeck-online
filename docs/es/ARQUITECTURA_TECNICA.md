# 🏗️ Arquitectura Técnica TeraDeck Online

## 📋 Visión General

TeraDeck Online es una aplicación web multijugador en tiempo real construida con una arquitectura moderna y escalable que separa responsabilidades entre frontend, backend y lógica compartida.

## 🎯 Arquitectura del Sistema

```mermaid
graph TB
    subgraph "🌐 Cliente (Frontend)"
        A[React + TypeScript]
        B[Zustand Store]
        C[Socket.IO Client]
        D[PWA Service Worker]
        E[TailwindCSS + Framer Motion]
    end

    subgraph "⚡ Comunicación"
        F[WebSockets]
        G[HTTP API]
    end

    subgraph "🖥️ Servidor (Backend)"
        H[Node.js + Express]
        I[Socket.IO Server]
        J[Game Manager]
        K[Room Manager]
    end

    subgraph "📚 Lógica Compartida"
        L[Game Logic]
        M[Card Effects]
        N[Types & Constants]
        O[Validations]
    end

    A --> F
    C --> F
    F --> I
    A --> G
    G --> H
    I --> J
    J --> L
    J --> M
    K --> J

    L --> N
    M --> N
    L --> O
    M --> O
```

## 📁 Estructura del Monorepo

```mermaid
graph LR
    subgraph "📦 TeraDeck Monorepo"
        A[📱 frontend/]
        B[🖥️ backend/]
        C[📚 shared/]
        D[🎨 assets/]
        E[📖 docs/]
    end

    A -->|Importa| C
    B -->|Importa| C
    A -->|Usa| D
    B -->|Sirve| D
```

### 🎨 Frontend (React + TypeScript)

```mermaid
graph TD
    subgraph "📱 Frontend Architecture"
        A[🏠 App.tsx] --> B[🛣️ Router]
        B --> C[🎮 Game Components]
        B --> D[🏛️ Lobby Components]
        B --> E[⚙️ Common Components]

        F[📦 Zustand Store] --> G[🎯 Game State]
        F --> H[👥 Player State]
        F --> I[🌐 UI State]

        J[🔌 Socket Service] --> K[📡 Real-time Events]
        J --> L[🎮 Game Actions]

        M[🎨 Styles] --> N[📱 TailwindCSS]
        M --> O[✨ Framer Motion]

        C --> F
        D --> F
        C --> J
        D --> J

        P[🌍 i18n] --> Q[🇪🇸 Spanish]
        P --> R[🇺🇸 English]
        P --> S[🇫🇷 French +4]

        C --> P
        D --> P
        E --> P
    end
```

### 🖥️ Backend (Node.js + Express)

```mermaid
graph TD
    subgraph "🖥️ Backend Architecture"
        A[🚀 index.ts] --> B[📡 Express Server]
        A --> C[🔌 Socket.IO Server]

        B --> D[🛡️ Middleware]
        B --> E[🎯 Controllers]

        C --> F[🎮 Game Socket Handler]
        C --> G[🏛️ Lobby Socket Handler]

        H[🎯 Game Manager] --> I[🏠 Room Management]
        H --> J[👥 Player Management]
        H --> K[🎮 Game State Management]

        F --> H
        G --> H

        L[📚 Shared Logic] --> M[🎯 Game Rules]
        L --> N[🃏 Card Effects]
        L --> O[✅ Validations]

        H --> L

        P[🤖 AI Players] --> Q[🎲 Random AI]
        P --> R[🧠 Smart AI]
        P --> S[🏆 Expert AI]

        H --> P
    end
```

### 📚 Shared Module (Lógica Compartida)

```mermaid
graph TD
    subgraph "📚 Shared Module"
        A[🎯 Game Logic] --> B[🎮 Game State Manager]
        A --> C[🔄 Turn Management]
        A --> D[🏆 Win Conditions]

        E[🃏 Card Effects] --> F[🏗️ Module Effects]
        E --> G[🐛 Bug Effects]
        E --> H[🔧 Patch Effects]
        E --> I[⚙️ Operation Effects]

        J[📝 Types] --> K[🃏 Card Types]
        J --> L[👥 Player Types]
        J --> M[🎮 Game Types]
        J --> N[📡 Action Types]

        O[📊 Constants] --> P[🎴 Card Definitions]
        O --> Q[🎯 Game Rules]
        O --> R[🌈 Colors & States]

        S[✅ Validations] --> T[🎯 Action Validation]
        S --> U[🃏 Card Validation]
        S --> V[🎮 State Validation]

        A --> J
        E --> J
        A --> S
        E --> S
        A --> O
        E --> O
    end
```

## 🔄 Flujo de Datos en Tiempo Real

```mermaid
sequenceDiagram
    participant C as 🎮 Cliente
    participant S as 🖥️ Servidor
    participant GM as 🎯 Game Manager
    participant GL as 📚 Game Logic

    Note over C,GL: Acción de Juego
    C->>S: Socket: play_card
    S->>GM: processAction()
    GM->>GL: validateAction()
    GL-->>GM: validation result

    alt Acción Válida
        GM->>GL: executeAction()
        GL-->>GM: new game state
        GM->>S: Broadcast state update
        S->>C: Socket: game_state_updated
        S->>C: Socket: turn_changed

        Note over S,GL: Verificar Victoria
        GM->>GL: checkWinCondition()
        GL-->>GM: win condition

        opt Alguien Ganó
            GM->>S: Broadcast game_ended
            S->>C: Socket: game_ended
        end
    else Acción Inválida
        S->>C: Socket: action_error
    end
```

## 🎮 Lógica de Juego Core

```mermaid
stateDiagram-v2
    [*] --> WaitingPlayers: Crear Sala
    WaitingPlayers --> GameStarted: Iniciar Juego

    state GameStarted {
        [*] --> PlayerTurn
        PlayerTurn --> ValidateAction: Jugador Actúa
        ValidateAction --> ExecuteAction: Válida
        ValidateAction --> PlayerTurn: Inválida
        ExecuteAction --> CheckWinCondition: Acción Ejecutada
        CheckWinCondition --> GameEnded: Alguien Ganó
        CheckWinCondition --> NextPlayer: Continúa
        NextPlayer --> PlayerTurn: Turno Siguiente
    }

    GameEnded --> [*]: Partida Terminada
```

### 🃏 Sistema de Cartas

```mermaid
classDiagram
    class Card {
        +id: string
        +name: LocalizedText
        +description: LocalizedText
        +type: CardType
    }

    class ModuleCard {
        +color: ModuleColor
        +state: ModuleState
        +bugs: BugCard[]
        +patches: PatchCard[]
        +isStabilized: boolean
    }

    class BugCard {
        +color: ModuleColor
        +targetTypes: ModuleColor[]
    }

    class PatchCard {
        +color: ModuleColor
        +targetTypes: ModuleColor[]
    }

    class OperationCard {
        +effect: OperationEffect
        +targetSelection: TargetSelection
    }

    Card <|-- ModuleCard
    Card <|-- BugCard
    Card <|-- PatchCard
    Card <|-- OperationCard
```

## 🔌 Eventos de WebSocket

```mermaid
graph LR
    subgraph "📤 Cliente → Servidor"
        A[create_room]
        B[join_room]
        C[start_game]
        D[play_card]
        E[discard_cards]
        F[pass_turn]
    end

    subgraph "📥 Servidor → Cliente"
        G[room_created]
        H[player_joined]
        I[game_started]
        J[game_state_updated]
        K[turn_changed]
        L[game_ended]
        M[action_error]
        N[player_disconnected]
    end

    A -.-> G
    B -.-> H
    C -.-> I
    D -.-> J
    E -.-> K
    F -.-> K
```

### 📡 Protocolo de Comunicación

| Evento               | Dirección | Datos                         | Descripción        |
| -------------------- | --------- | ----------------------------- | ------------------ |
| `create_room`        | C→S       | `{playerName, settings}`      | Crear nueva sala   |
| `join_room`          | C→S       | `{roomCode, playerName}`      | Unirse a sala      |
| `play_card`          | C→S       | `{card, target?, selection?}` | Jugar carta        |
| `game_state_updated` | S→C       | `GameState`                   | Estado actualizado |
| `turn_changed`       | S→C       | `{currentPlayer, actions}`    | Cambio de turno    |

## 🤖 Sistema de IA

```mermaid
graph TD
    subgraph "🤖 AI System"
        A[AI Player Manager] --> B{Dificultad}

        B -->|Fácil| C[Random AI]
        B -->|Normal| D[Balanced AI]
        B -->|Difícil| E[Strategic AI]

        C --> F[Acción Aleatoria]
        D --> G[Evaluación Básica]
        E --> H[Evaluación Avanzada]

        F --> I[Ejecutar Acción]
        G --> I
        H --> I

        I --> J[Delay Humano]
        J --> K[Broadcast Action]
    end
```

### 🎯 Estrategias de IA

```mermaid
flowchart TD
    A[Turno de IA] --> B{Evaluar Estado}

    B --> C{¿Puede Ganar?}
    C -->|Sí| D[Priorizar Victoria]

    C -->|No| E{¿Rival Cerca de Ganar?}
    E -->|Sí| F[Sabotear Rival]

    E -->|No| G{¿Defender o Atacar?}
    G -->|Defender| H[Estabilizar Módulos]
    G -->|Atacar| I[Buggear Rivales]

    D --> J[Seleccionar Mejor Carta]
    F --> J
    H --> J
    I --> J

    J --> K[Ejecutar Acción]
```

## 📱 Progressive Web App (PWA)

```mermaid
graph TD
    subgraph "📱 PWA Features"
        A[Service Worker] --> B[Cache Strategy]
        A --> C[Background Sync]
        A --> D[Push Notifications]

        E[Manifest.json] --> F[App Install]
        E --> G[Theme Colors]
        E --> H[Icons & Splash]

        I[Offline Mode] --> J[Cache Game Assets]
        I --> K[Local AI Games]
        I --> L[Offline Queue]

        B --> M[Cache First: Assets]
        B --> N[Network First: API]
        B --> O[Stale While Revalidate: Game Data]
    end
```

## 🌍 Internacionalización (i18n)

```mermaid
graph LR
    subgraph "🌍 i18n System"
        A[Language Detector] --> B{User Language}

        B --> C[🇪🇸 Spanish]
        B --> D[🇺🇸 English]
        B --> E[🇫🇷 French]
        B --> F[🇵🇹 Portuguese]
        B --> G[🇮🇹 Italian]
        B --> H[🇩🇪 German]

        I[Translation Keys] --> J[Game Rules]
        I --> K[UI Text]
        I --> L[Card Names]
        I --> M[Error Messages]

        C --> I
        D --> I
        E --> I
        F --> I
        G --> I
        H --> I
    end
```

## 🧪 Testing Strategy

```mermaid
graph TD
    subgraph "🧪 Testing Pyramid"
        A[Unit Tests] --> B[Game Logic Tests]
        A --> C[Card Effect Tests]
        A --> D[Validation Tests]

        E[Integration Tests] --> F[API Tests]
        E --> G[Socket Tests]
        E --> H[Component Tests]

        I[E2E Tests] --> J[Game Flow Tests]
        I --> K[Multiplayer Tests]
        I --> L[PWA Tests]

        A --> E
        E --> I
    end
```

## 🚀 Despliegue y Escalabilidad

```mermaid
graph TB
    subgraph "🚀 Production Architecture"
        A[Load Balancer] --> B[Frontend CDN]
        A --> C[Backend Cluster]

        B --> D[Static Assets]
        B --> E[PWA Files]

        C --> F[Node.js Instance 1]
        C --> G[Node.js Instance 2]
        C --> H[Node.js Instance N]

        I[Redis Cluster] --> J[Session Store]
        I --> K[Game State Cache]
        I --> L[Socket.IO Adapter]

        F --> I
        G --> I
        H --> I

        M[Database] --> N[User Data]
        M --> O[Game History]
        M --> P[Statistics]

        F --> M
        G --> M
        H --> M
    end
```

## 📊 Métricas y Monitoring

```mermaid
graph LR
    subgraph "📊 Monitoring Stack"
        A[Application Metrics] --> B[Game Sessions]
        A --> C[Player Actions]
        A --> D[Response Times]

        E[System Metrics] --> F[CPU/Memory]
        E --> G[Network I/O]
        E --> H[WebSocket Connections]

        I[Business Metrics] --> J[Daily Active Users]
        I --> K[Game Completion Rate]
        I --> L[Average Game Duration]

        M[Error Tracking] --> N[Client Errors]
        M --> O[Server Errors]
        M --> P[Failed Connections]
    end
```

---

## 🔗 Referencias Técnicas

- **Framework Frontend**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand)
- **Comunicación RT**: [Socket.IO](https://socket.io/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

**TeraDeck Team - Arquitectura Técnica** 🚀
