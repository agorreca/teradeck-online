# 🎴 TeraDeck Online

**Una implementación digital multijugador del juego de cartas TeraDeck.**

TeraDeck Online es una recreación completa del juego físico TeraDeck, desarrollado como una aplicación web moderna con soporte para multijugador en tiempo real, sistema de IA avanzado, y completa internacionalización.

## 🎯 Características Principales

### ✨ Experiencia de Juego

- **Multijugador en tiempo real** con Socket.IO
- **Sistema de IA** con 3 niveles de dificultad (Fácil, Normal, Difícil)
- **10 personalidades de IA** únicas con nombres temáticos de programación
- **Sistema de targeting avanzado** para cartas especiales
- **Internacionalización completa** (Español/Inglés)
- **PWA Ready** - Instalable como app móvil

### 🎲 Mecánicas del Juego Real

- **68 cartas auténticas** del juego original
- **4 tipos de módulos**: Backend, Frontend, Mobile, Data Science
- **Sistema de bugs y parches** con compatibilidad de colores
- **5 operaciones especiales** con efectos únicos
- **Condición de victoria real**: 4 módulos estables de diferentes tipos

### 🛠️ Tecnología Moderna

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + Socket.IO + TypeScript
- **Monorepo**: Yarn Workspaces con código compartido
- **Calidad**: ESLint + Prettier + Testing con Jest

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- Yarn o npm

### Instalación y Ejecución

```bash
# Clonar el repositorio
git clone <repository-url>
cd TeraDeck

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## 🎮 Cómo Jugar

### Objetivo

Ser el primer jugador en reunir **4 módulos estables** de diferentes tipos (Backend, Frontend, Mobile, Data Science).

### Tipos de Cartas

#### 🔧 Módulos (21 cartas)

- **Backend** (azul): Servidor y lógica de negocio
- **Frontend** (amarillo): Interfaz de usuario
- **Mobile** (rojo): Aplicación móvil
- **Data Science** (verde): Análisis de datos e IA
- **Multicolor**: Comodín que puede ser cualquier tipo

#### 🐛 Bugs (17 cartas)

- Sabotean módulos enemigos del color correspondiente
- No pueden afectar módulos estabilizados (con 2+ parches)
- Bug multicolor puede atacar cualquier módulo

#### 🔧 Parches (20 cartas)

- Protegen y reparan módulos propios
- 1 parche = módulo protegido temporalmente
- 2+ parches = módulo estabilizado permanentemente

#### ⚡ Operaciones (10 cartas)

- **Cambio de Arquitecto**: Intercambio de manos entre jugadores
- **Reclutamiento del Groso**: Roba 2 cartas adicionales
- **Phishing Interno**: Distribuye bugs propios en enemigos
- **Fiesta de Fin de Año**: Todos descartan y pierden turno
- **Project Swap**: Intercambio de módulos entre jugadores

### Turno del Jugador

1. **Robar 1 carta** (automático)
2. **Elegir una acción**:
   - Jugar 1 carta (puede requerir targeting)
   - O descartar 1-3 cartas
3. **Robar hasta tener 3 cartas** (automático)

### Sistema de Targeting

Las cartas que requieren objetivos mostrarán un overlay interactivo:

- **Bugs**: Selecciona módulos enemigos compatibles
- **Parches**: Selecciona módulos propios
- **Operaciones**: Selecciona jugadores/módulos según efecto

_Prueba la **Demo del Sistema de Targeting** disponible en el lobby._

## 🤖 Sistema de IA

### Niveles de Dificultad

#### 🟢 Fácil

- Movimientos aleatorios válidos
- Tiempo de decisión: ~750ms
- Ideal para nuevos jugadores

#### 🟡 Normal

- Prioriza módulos y ataca al líder
- Estrategia balanceada ataque/defensa
- Tiempo de decisión: ~1.5s

#### 🔴 Difícil

- Análisis avanzado de fases del juego
- Optimización y bloqueo de oponentes
- Tiempo de decisión: ~3s

### Personalidades de IA

Cada IA tiene personalidad única con rasgos específicos:

- **DevBot Jr.** (Fácil) - Novato impredecible
- **CodeCrafter** (Normal) - Programador competente
- **BugHunter** (Normal) - Especialista en sabotaje
- **ArchMaster** (Difícil) - Arquitecto estratégico
- **SysAdmin** (Difícil) - Veterano defensivo
- **DataNinja** (Difícil) - Maestro de operaciones
- **FrontendFox** (Normal) - Ágil pero impaciente
- **BackendBear** (Normal) - Sólido y defensivo
- **MobileMonkey** (Fácil) - Energético pero errático
- **QualityQueen** (Difícil) - Meticulosa y optimizada

## 🏗️ Arquitectura del Proyecto

```
TeraDeck/
├── frontend/          # React + TypeScript app
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── services/     # Servicios frontend
│   │   └── styles/       # Estilos CSS
├── backend/           # Node.js + Express server
│   ├── src/
│   │   ├── controllers/  # Controladores de rutas
│   │   ├── services/     # Lógica de negocio y IA
│   │   ├── middleware/   # Middlewares Express
│   │   └── socket/       # Manejo de WebSocket
├── shared/            # Código compartido
│   ├── src/
│   │   ├── types/        # Tipos TypeScript
│   │   ├── utils/        # Utilidades compartidas
│   │   ├── game/         # Lógica del juego
│   │   └── i18n/         # Sistema de traducciones
└── docs/              # Documentación
```

## 🛠️ Scripts de Desarrollo

```bash
# Desarrollo (frontend + backend)
npm run dev

# Solo frontend
npm run dev:frontend

# Solo backend
npm run dev:backend

# Build para producción
npm run build

# Tests
npm test

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

## 🌐 Internacionalización

El juego soporta completamente español e inglés:

- **Interfaz de usuario** traducida
- **Nombres y descripciones de cartas** multiidioma
- **Mensajes de error** localizados
- **Instrucciones de targeting** contextuales
- **Cambio de idioma** en tiempo real

## 🔧 Configuración

### Variables de Entorno

```bash
# Backend
PORT=3001
NODE_ENV=development

# Frontend
VITE_BACKEND_URL=http://localhost:3001
```

### Hosting

El proyecto está optimizado para deployment en:

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, DigitalOcean
- **Socket.IO**: Soporta clustering y Redis para escalabilidad

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Convenciones de Commit

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Documentación
- `refactor`: Refactoring sin cambios funcionales
- `test`: Tests
- `style`: Cambios de formato

## 📝 Licencia

[MIT License](LICENSE) - El proyecto es de código abierto.

## 🎯 Roadmap

- [ ] **Sistema de puntuación y estadísticas**
- [ ] **Torneos y ranking de jugadores**
- [ ] **Efectos visuales y animaciones avanzadas**
- [ ] **Modo espectador para partidas**
- [ ] **Chat en tiempo real durante partidas**
- [ ] **Replay system para revisar partidas**
- [ ] **Expansiones con cartas adicionales**

---

**¡Desarrollado con ❤️ por un equipo apasionado por TeraDeck!**

_¿Encontraste un bug? ¿Tienes una idea genial? ¡Abre un issue o contribuye al proyecto!_
