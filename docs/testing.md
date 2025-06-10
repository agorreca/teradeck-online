# Estructura de Tests - TeraDeck Online

## Arquitectura de Testing

Esta estructura de tests está diseñada para proporcionar cobertura completa del proyecto TeraDeck Online, cubriendo tanto el backend como el frontend con diferentes tipos de testing.

## Estructura de Directorios

### Backend Tests (`backend/tests/`)

```
backend/tests/
├── unit/                           # Tests unitarios
│   ├── controllers/               # Tests de controladores
│   │   └── gameController.test.ts
│   ├── socket/                    # Tests de eventos socket
│   │   └── gameSocket.test.ts
│   └── game-logic/               # Tests de lógica de juego
│       ├── modules.test.ts       # Tests de módulos del juego
│       ├── patches.test.ts       # Tests de parches
│       └── bugs.test.ts          # Tests de bugs conocidos
├── integration/                   # Tests de integración
│   └── gameFlow.test.ts          # Flujo completo del juego
├── GameManager.test.ts           # Tests del GameManager principal
└── GameManager.advanced.test.ts  # Tests avanzados del GameManager
```

### Frontend Tests (`frontend/src/__tests__/`)

```
frontend/src/__tests__/
├── components/                    # Tests de componentes React
│   ├── Lobby.test.tsx            # Tests del componente Lobby
│   └── GameRoom.test.tsx         # Tests del componente GameRoom
├── hooks/                        # Tests de custom hooks
│   └── useGameSocket.test.ts     # Tests del hook de socket
├── __mocks__/                    # Mocks para testing
│   └── fileMock.js              # Mock para archivos estáticos
└── setup.ts                     # Configuración de testing
```

## Configuración

### Backend (Jest + TypeScript)

- **Configuración**: `backend/jest.config.js`
- **Setup**: `backend/jest.setup.js`
- **Framework**: Jest con soporte para TypeScript
- **Mocks**: Socket.IO, GameManager singleton

### Frontend (Jest + React Testing Library)

- **Configuración**: `frontend/jest.config.js`
- **Setup**: `frontend/src/__tests__/setup.ts`
- **Framework**: Jest + React Testing Library + jsdom
- **Mocks**: React Router, socket.io-client, react-i18next

## Tipos de Tests

### 1. Tests Unitarios

**Backend (`backend/tests/unit/`)**

- Controladores HTTP
- Handlers de eventos Socket.IO
- Lógica de juego individual
- Utilidades y helpers

**Frontend (`frontend/src/__tests__/components/`, `frontend/src/__tests__/hooks/`)**

- Componentes React individuales
- Custom hooks
- Utilidades del frontend

### 2. Tests de Integración

**Backend (`backend/tests/integration/`)**

- Flujo completo de creación y unión a salas
- Interacción entre GameManager y Socket.IO
- Simulación de partidas completas con IA

**Frontend**

- Integración de componentes con Redux store
- Flujo completo de navegación entre pantallas

### 3. Tests del Sistema Principal

**GameManager (`backend/tests/GameManager.*.test.ts`)**

- Gestión de salas y jugadores
- Estados del juego
- Sincronización de eventos
- Manejo de desconexiones

## Scripts de Testing

### Comandos Principales

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Cobertura completa
npm run test:coverage

# Solo backend
npm run test:backend

# Solo frontend
npm run test:frontend
```

### Comandos Específicos

```bash
# Backend con watch
cd backend && npm run test:watch

# Frontend con watch
cd frontend && npm run test:watch

# Cobertura backend
cd backend && npm run test:coverage

# Cobertura frontend
cd frontend && npm run test:coverage
```

## Cobertura Objetivo

### Backend

- **Funciones**: >80%
- **Líneas**: >80%
- **Branches**: >75%
- **Statements**: >80%

### Frontend

- **Funciones**: >70%
- **Líneas**: >70%
- **Branches**: >70%
- **Statements**: >70%

## Mocking Strategy

### Backend Mocks

- **GameManager**: Singleton mockeado para aislar tests
- **Socket.IO**: Mock de servidor y cliente para tests de integración
- **Dependencias externas**: Módulos npm necesarios

### Frontend Mocks

- **react-router-dom**: Navigation y routing
- **socket.io-client**: Conexiones de socket
- **react-i18next**: Sistema de traducciones
- **Redux store**: Estados de la aplicación

## Patterns de Testing

### Arrange-Act-Assert (AAA)

Todos los tests siguen el patrón AAA:

1. **Arrange**: Configurar datos y mocks
2. **Act**: Ejecutar la función/acción
3. **Assert**: Verificar resultados

### Ejemplo Backend:

```typescript
it('should create room successfully', () => {
  // Arrange
  const roomData = { nickname: 'Player', maxPlayers: 4, aiOpponents: 2 };
  const mockRoom = { code: 'ABC123', players: [], status: 'waiting' };
  mockGameManager.createRoom.mockReturnValue(mockRoom);

  // Act
  gameController.createRoom(mockRequest, mockResponse);

  // Assert
  expect(mockGameManager.createRoom).toHaveBeenCalledWith(roomData);
  expect(mockResponse.json).toHaveBeenCalledWith({ room: mockRoom });
});
```

### Ejemplo Frontend:

```typescript
it('should render lobby title', () => {
  // Arrange & Act
  renderWithProviders(<Lobby />);

  // Assert
  expect(screen.getByText('TeraDeck Online')).toBeInTheDocument();
});
```

## Casos de Test Críticos

### Backend

1. **Creación de salas** con diferentes configuraciones
2. **Unión a salas** con validaciones
3. **Inicio de juegos** con IA
4. **Manejo de desconexiones** de jugadores
5. **Sincronización de estados** entre clientes

### Frontend

1. **Navegación** entre lobby y sala de juego
2. **Formularios** de creación y unión
3. **Estados de carga** y errores
4. **Sincronización** con el estado del servidor
5. **Interacciones de usuario** (botones, inputs)

## Integración Continua

Los tests están configurados para ejecutarse automáticamente:

- **Pre-commit**: Tests unitarios rápidos
- **CI/CD**: Suite completa incluyendo integración
- **Coverage reports**: Generados en cada ejecución

## Debugging Tests

### Backend

```bash
# Debug con Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Logs detallados
DEBUG=* npm test
```

### Frontend

```bash
# Debug en browser
npm run test:debug

# Logs de React Testing Library
DEBUG_PRINT_LIMIT=0 npm test
```

## Mantenimiento

### Actualización de Tests

1. Agregar tests para nuevas features
2. Actualizar mocks cuando cambien las APIs
3. Revisar cobertura regularmente
4. Refactorizar tests obsoletos

### Limpieza de Código de Test

1. Eliminar tests duplicados
2. Consolidar utilities comunes
3. Mantener mocks actualizados
4. Documentar casos edge importantes

Esta estructura de tests proporciona una base sólida para mantener la calidad del código y detectar regresiones tempranamente en el desarrollo de TeraDeck Online.
