# 🎮 TeraDeck Online

**TeraDeck** is a digital adaptation of the popular card game "Virus!" by Tranjis Games, set in the software development world. Build your stable tech stack while sabotaging your competitors with bugs and protecting your systems with patches.

![TeraDeck Banner](../../assets/teradeck-banner.png)

## 🚀 Main Features

### ✨ Gameplay

- **Objective**: Gather 4 stable modules (Frontend, Backend, Mobile, Data Science)
- **Mechanics**: Play cards, apply bugs/patches, use special operations
- **Multiplayer**: 2-6 players in real-time
- **AI**: Support for AI players with different difficulties

### 🎨 Modern Technologies

- **Frontend**: React 18 + TypeScript + Vite + PWA
- **Backend**: Node.js + Express + Socket.IO
- **Styling**: Tailwind CSS + Framer Motion
- **UI**: Radix UI for accessibility
- **Internationalization**: react-i18next (Spanish/English)
- **Architecture**: Monorepo with shared types

### 🌐 Technical Features

- **Real-time**: Instant synchronization with Socket.IO
- **PWA**: Installable and works offline
- **Responsive**: Optimized for mobile and desktop
- **Multi-language**: Dynamic switching between Spanish and English
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: Accessible components with Radix UI

## 📦 Project Structure

```
TeraDeck/
├── frontend/           # React App (Vite + PWA)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   ├── i18n/       # i18next configuration
│   │   ├── services/   # API services
│   │   ├── store/      # Global state
│   │   └── styles/     # Tailwind styles
│   ├── public/         # Static assets
│   └── package.json
├── backend/            # Node.js Server
│   ├── src/
│   │   ├── controllers/# HTTP controllers
│   │   ├── services/   # Business logic
│   │   ├── socket/     # Socket.IO events
│   │   └── middleware/ # Express middlewares
│   └── package.json
├── shared/             # Shared code
│   ├── src/
│   │   ├── types/      # TypeScript types
│   │   ├── constants/  # Constants and cards
│   │   ├── game/       # Game logic
│   │   ├── i18n/       # Translations
│   │   └── utils/      # Utilities
│   └── package.json
├── tests/              # Unit and integration tests
├── docs/               # Technical documentation
└── assets/             # Project assets
```

## 🎯 Game Rules

### 🎲 Objective

Be the first player to gather **4 stable modules** of different types:

- **Backend** (blue) 🔵
- **Frontend** (yellow) 🟡
- **Mobile** (red) 🔴
- **Data Science** (green) 🟢

### 🃏 Card Types (68 total)

#### 📱 Modules (21 cards)

- **1 Multicolor** + **5 of each type**
- Placed freely and can be affected by bugs/patches

#### 🐛 Bugs (17 cards)

- **1 Multicolor** + **4 of each type**
- **Effect**: Sabotage modules, destroy patches, collapse modules
- Only affect modules of the same color (multicolor affects any)

#### 🔧 Patches (20 cards)

- **4 Multicolors** + **4 of each type**
- **Effect**: Repair bugs, protect modules, stabilize (2 patches = stable)
- Only affect modules of the same color (multicolor affects any)

#### ⚙️ Operations (10 cards)

- **3 Architect Change**: Exchange modules between players
- **3 Ace Recruitment**: Steal a non-stabilized module
- **2 Internal Phishing**: Move your bugs to rival free modules
- **1 End Year Party**: Everyone else discards and skips turn
- **1 Project Swap**: Exchange all modules with another player

### 🎮 Turn Mechanics

**On your turn you can do ONE of these actions:**

1. **Play 1 card** from your hand
2. **Discard 1-3 cards** and draw the same amount

**After your action:**

- Draw cards until you have 3 in hand
- Pass turn to the next player

### 🏆 Module States

| State          | Description                          | Visual                |
| -------------- | ------------------------------------ | --------------------- |
| **Free**       | No bugs or patches                   | Green border          |
| **Patched**    | With 1 patch, protected              | Blue border with glow |
| **Bugged**     | With bugs, doesn't count for victory | Red pulsing border    |
| **Stabilized** | With 2+ patches, immune to bugs      | Golden glowing border |

### 🎯 Victory Condition

**You win when you have 4 stable modules (without bugs) of different types.**

Multicolor modules can count as any type you're missing.

## 🛠️ Installation and Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-user/teradeck.git
cd teradeck

# Install dependencies in all workspaces
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install shared dependencies
cd ../shared
npm install
```

### Development Scripts

```bash
# Run frontend in development mode
cd frontend
npm run dev          # http://localhost:5173

# Run backend in development mode
cd backend
npm run dev          # http://localhost:3001

# Run tests
npm test

# Build for production
npm run build

# Linting and formatting
npm run lint
npm run format
```

### Environment Variables

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

**Backend** (`backend/.env`):

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🏗️ Technical Architecture

### Frontend (React + TypeScript)

```typescript
// Example component with modern libraries
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';

function Card({ card }: { card: CardType }) {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-xl shadow-lg p-4"
    >
      <h3>{t(`cards.${card.name}`)}</h3>
    </motion.div>
  );
}
```

### Backend (Node.js + Socket.IO)

```typescript
// Example Socket.IO event
io.on('connection', socket => {
  socket.on('play-card', async data => {
    const result = await gameService.playCard(data);
    if (result.success) {
      io.to(data.roomId).emit('game-updated', result.gameState);
    }
  });
});
```

### Shared (Types and Logic)

```typescript
// Shared TypeScript types
export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
}

export interface Card {
  id: string;
  type: CardType;
  color?: ModuleColor;
  name: LocalizedText;
  description: LocalizedText;
}
```

## 🌍 Internationalization

### Configuration

- **Framework**: react-i18next
- **Languages**: Spanish (default), English
- **Persistence**: localStorage
- **Detection**: Browser, localStorage, HTML lang

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('ui.lobby.title')}</h1>
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
    </div>
  );
}
```

### Translation Structure

```typescript
// shared/src/i18n/locales/en.ts
export const en = {
  ui: {
    lobby: {
      title: 'TeraDeck Online',
      createGame: 'Create Game',
    },
  },
  cards: {
    modules: {
      backend: 'Backend Server',
    },
  },
};
```

## 🎨 Design System

### Theme Colors

```css
/* Tailwind custom colors */
.teradeck-colors {
  --backend: #2196f3; /* Blue */
  --frontend: #ffc107; /* Yellow */
  --mobile: #f44336; /* Red */
  --data-science: #4caf50; /* Green */
}
```

### Base Components

- **Card**: Card component with animations
- **Modal**: Accessible dialog with Radix UI
- **Button**: Buttons with variants and states
- **Input**: Input fields with validation

### Animations

```typescript
// Framer Motion variants
const cardVariants = {
  hover: { scale: 1.05, rotateY: 5 },
  tap: { scale: 0.98 },
};
```

## 🧪 Testing

### Configuration

- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **E2E**: Playwright

### Running Tests

```bash
# Unit tests
npm test

# Tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)

```bash
# Production build
npm run build

# Preview
npm run preview
```

### Backend (Railway/Heroku)

```bash
# Required environment variables
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

### Docker

```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Flow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Descriptive commits (`git commit -m 'feat: add new card'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

### Code Standards

- **TypeScript**: Strict typing
- **ESLint**: Automatic linting
- **Prettier**: Consistent formatting
- **Conventional Commits**: Standardized messages

### Issues and Bugs

Report issues on [GitHub Issues](https://github.com/your-user/teradeck/issues) with:

- Detailed description
- Steps to reproduce
- Screenshots if applicable
- Browser/device information

## 📝 License

This project is under the MIT License. See [LICENSE](LICENSE) for more details.

## 🙏 Acknowledgments

- **Tranjis Games** for the original "Virus!" game
- **Open Source Community** for the libraries used
- **Contributors** who have improved the project

## 📞 Contact

- **Developer**: Your Name
- **Email**: your@email.com
- **GitHub**: [@your-user](https://github.com/your-user)
- **Discord**: TeraDeck Server

---

🎮 **Enjoy building your perfect stack in TeraDeck!** 🎮
