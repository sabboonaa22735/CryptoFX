# CryptoFX - Multi-Asset Trading Platform Specification

## Project Overview
- **Project Name**: CryptoFX
- **Type**: Full-stack MERN Trading Platform
- **Core Functionality**: Real-time multi-asset trading with AI assistance, admin management, and premium UI
- **Target Users**: Traders, investors, and administrators

## Tech Stack
- Frontend: React 18 + Vite + TypeScript
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Realtime: Socket.io
- State: Zustand + React Query
- Styling: Tailwind CSS + Framer Motion
- Charts: Lightweight Charts (TradingView)
- Auth: JWT + Refresh Tokens

## UI/UX Specification

### Color Palette
- Background Primary: #0a0a0f (deep black)
- Background Secondary: #12121a (dark navy)
- Background Tertiary: #1a1a25 (card background)
- Accent Primary: #00d4aa (cyan/teal)
- Accent Secondary: #7c3aed (purple)
- Accent Gradient: linear-gradient(135deg, #00d4aa 0%, #7c3aed 100%)
- Success: #10b981 (green)
- Danger: #ef4444 (red)
- Warning: #f59e0b (orange)
- Text Primary: #ffffff
- Text Secondary: #9ca3af
- Text Muted: #6b7280
- Border: #2a2a3a
- Glass: rgba(255, 255, 255, 0.05)

### Typography
- Font Family: 'Inter', 'SF Pro Display', system-ui
- Headings: 700 weight
- Body: 400 weight
- Monospace: 'JetBrains Mono', monospace (for prices)

### Visual Effects
- Glassmorphism: backdrop-blur-xl, bg-white/5
- Card shadows: 0 8px 32px rgba(0, 0, 0, 0.3)
- Hover transitions: 200ms ease
- Page transitions: Framer Motion
- 3D elements: Three.js for hero section

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Pages Structure

### User Pages
1. Landing Page - Hero with 3D elements, features, CTA
2. Login/Register - Social auth, face recognition option
3. Dashboard - Portfolio overview, charts, quick trades
4. Markets - Full market listing with filters
5. Trading - Full trading interface with charts, order book
6. Portfolio - Holdings, P&L, history
7. Wallet - Deposit, withdraw, transactions
8. AI Assistant - Chat interface for AI help
9. Support - Live chat with support

### Admin Pages
1. Dashboard - Analytics, charts, key metrics
2. Users - User management table
3. Trades - Trade monitoring
4. Markets - Market controls
5. Support - Ticket management
6. Settings - Platform settings

## Core Features

### Trading
- Spot trading with market/limit orders
- Futures trading with leverage
- Real-time price updates via WebSocket
- Order book visualization
- Trade history

### Authentication
- Email/password registration
- Google OAuth
- Apple OAuth
- Face recognition (FaceIO)
- JWT + refresh tokens

### AI Features
- AI Trading Assistant (chat)
- Market insights
- Portfolio suggestions
- Price predictions

### Chat System
- Real-time messaging
- User-to-user chat
- Support chat
- Typing indicators
- Message history

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/google
- POST /api/auth/apple
- POST /api/auth/face-verify

### Users
- GET /api/users/me
- PUT /api/users/me
- GET /api/users (admin)

### Markets
- GET /api/markets
- GET /api/markets/:symbol
- GET /api/markets/:symbol/candles
- GET /api/markets/orderbook/:symbol

### Trading
- POST /api/trades
- GET /api/trades/my
- GET /api/trades (admin)
- DELETE /api/trades/:id

### Wallet
- GET /api/wallet
- POST /api/wallet/deposit
- POST /api/wallet/withdraw
- GET /api/wallet/transactions

### Support
- POST /api/support/ticket
- GET /api/support/tickets
- POST /api/support/tickets/:id/reply

## Acceptance Criteria
- [ ] All pages render without errors
- [ ] Authentication works with all methods
- [ ] Real-time price updates via WebSocket
- [ ] Trading interface functional
- [ ] Admin panel accessible and functional
- [ ] AI chat responds to queries
- [ ] Chat system works in real-time
- [ ] Responsive on all devices
- [ ] Smooth animations throughout





