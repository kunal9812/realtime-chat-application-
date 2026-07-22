<div align="center">

# 💬 ChatApp

### A beautiful, production-grade real-time chat application

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=for-the-badge&logo=socket.io)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

A sleek, dark-mode-first chat app with glassmorphism UI, sub-100ms message delivery, optimistic rendering, emoji reactions, typing indicators, and read receipts.

</div>

---

## ✨ Features

### 🎨 Visual & UX
- **Glassmorphism UI** — semi-transparent panels with `backdrop-filter` blur, ambient glow, and subtle borders
- **Optimistic message rendering** — messages appear instantly on send (60% opacity), snap to 100% on server ACK
- **Animated typing indicator** — staggered 3-dot bounce wave in real-time
- **Read receipts** — single grey tick → double blue ticks as messages are read
- **Emoji reactions** — hover a message to add/remove reactions with spring-pop animation
- **Online presence** — pulsing green dot on active user avatars
- **Image sharing** — inline image preview with click-to-expand lightbox
- **Dark / Light theme** — one-click toggle, preference saved to localStorage
- **Date separators** — messages grouped by day with "Today", "Yesterday" labels
- **Message grouping** — consecutive messages from the same sender are visually grouped

### ⚡ Technical
- **WebSockets via Socket.io** — persistent duplex channel for all real-time events
- **JWT Authentication** — stateless, token-stored in localStorage, sent as `Authorization: Bearer`
- **Prisma + SQLite** — zero-config database, schema migrations, and a seed script
- **Cursor-based pagination** — load older messages on scroll
- **Create rooms** — custom name, emoji icon, and color theme
- **Direct Messages** — one-on-one DM rooms
- **Room membership** — unread counts tracked per user per room

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Vanilla CSS with CSS custom properties (no Tailwind) |
| **Real-time** | Socket.io client + server |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | SQLite via Prisma ORM |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **Fonts** | Inter (body), DM Sans (headings) — Google Fonts |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/chat-application.git
cd chat-application
```

### 2. Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# (Edit .env if you want custom JWT secrets or port)

# Run database migrations
npx prisma migrate dev --name init

# Seed with demo data (2 users + 3 rooms + messages)
npx ts-node prisma/seed.ts

# Start the dev server
npm run dev
```

> Backend runs at **http://localhost:4000**

### 3. Set up the Frontend

Open a new terminal tab:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

> Frontend runs at **http://localhost:3000**

### 4. Open in browser

Go to **http://localhost:3000** — you'll be redirected to the login page.

---

## 🧪 Demo Accounts

The seed script creates two ready-to-use accounts:

| User | Email | Password |
|------|-------|----------|
| Alice 👩 | `alice@demo.com` | `demo1234` |
| Bob 👨 | `bob@demo.com` | `demo1234` |

> **Pro tip:** Open a normal tab as Alice and an incognito tab as Bob to test real-time features side by side.

---

## 🗂 Project Structure

```
chat-application/
├── backend/                        # Node.js + Express + Socket.io API
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema (6 models)
│   │   └── seed.ts                 # Demo data seeder
│   ├── src/
│   │   ├── index.ts                # Server entry point
│   │   ├── lib/
│   │   │   ├── prisma.ts           # Prisma client singleton
│   │   │   └── jwt.ts              # JWT sign/verify helpers
│   │   ├── middleware/
│   │   │   └── auth.ts             # JWT auth middleware
│   │   ├── routes/
│   │   │   ├── auth.ts             # /api/auth — register, login, me
│   │   │   ├── rooms.ts            # /api/rooms — list, create, join, DM
│   │   │   ├── messages.ts         # /api/messages — history, delete
│   │   │   └── users.ts            # /api/users — search, profile
│   │   └── socket/
│   │       ├── middleware.ts       # Socket JWT auth
│   │       └── handlers.ts         # All socket event handlers
│   ├── .env.example
│   └── package.json
│
└── frontend/                       # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── auth/page.tsx       # Login & Register page
        │   ├── chat/
        │   │   ├── layout.tsx      # Protected chat shell
        │   │   └── [roomId]/
        │   │       └── page.tsx    # Chat room page
        │   └── layout.tsx          # Root layout with providers
        ├── components/
        │   ├── chat/
        │   │   ├── ChatHeader.tsx          # Room name, members, online count
        │   │   ├── MessageList.tsx         # Scrollable message feed
        │   │   ├── MessageBubble.tsx       # Individual message with reactions
        │   │   ├── TypingIndicator.tsx     # Animated typing dots
        │   │   └── MessageInput.tsx        # Rich input bar
        │   ├── sidebar/
        │   │   ├── Sidebar.tsx             # Room list sidebar
        │   │   ├── RoomItem.tsx            # Room entry with unread badge
        │   │   └── CreateRoomModal.tsx     # Room creation form
        │   └── ui/
        │       ├── Avatar.tsx              # User avatar with presence dot
        │       ├── ThemeToggle.tsx         # Dark/light mode button
        │       └── EmojiPicker.tsx         # Built-in emoji picker (150+ emojis)
        ├── contexts/
        │   ├── AuthContext.tsx      # Auth state & methods
        │   └── SocketContext.tsx    # Socket connection management
        ├── hooks/
        │   ├── useMessages.ts       # Messages state + optimistic sends
        │   ├── useTyping.ts         # Typing indicator state
        │   └── useSocket.ts         # Stable socket event subscriptions
        ├── lib/
        │   ├── api.ts               # Axios API client
        │   ├── socket.ts            # Socket.io singleton
        │   └── types.ts             # Shared TypeScript interfaces
        └── styles/
            └── globals.css          # Design system (CSS vars, animations)
```

---

## 🔌 Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{ roomId }` | Join a chat room, reset unread count |
| `leave_room` | `{ roomId }` | Leave a chat room |
| `send_message` | `{ roomId, content, type, tempId }` | Send a message (TEXT or IMAGE) |
| `typing_start` | `{ roomId }` | Notify others you're typing |
| `typing_stop` | `{ roomId }` | Notify others you stopped typing |
| `mark_read` | `{ roomId, messageId? }` | Mark messages as read |
| `add_reaction` | `{ messageId, emoji }` | Add emoji reaction |
| `remove_reaction` | `{ messageId, emoji }` | Remove emoji reaction |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ ...message, tempId }` | Confirmed message with ACK |
| `user_typing` | `{ userId, roomId, username }` | Someone is typing |
| `user_stopped_typing` | `{ userId, roomId }` | Typing stopped |
| `message_read` | `{ messageId, userId, readAt }` | Read receipt update |
| `user_online` | `{ userId, roomId }` | User came online |
| `user_offline` | `{ userId, lastSeen }` | User went offline |
| `reaction_added` | `{ messageId, reaction }` | New reaction added |
| `reaction_removed` | `{ messageId, userId, emoji }` | Reaction removed |

---

## 🗃 Database Schema

```
User ──< RoomMember >── Room
User ──< Message ──< MessageRead
                  └──< Reaction
```

| Model | Purpose |
|-------|---------|
| `User` | Accounts with avatar, bio, online status |
| `Room` | Group chats and DMs with emoji + wallpaper |
| `RoomMember` | Many-to-many: tracks unread counts |
| `Message` | TEXT, IMAGE, or SYSTEM messages |
| `MessageRead` | Per-user read receipts |
| `Reaction` | Emoji reactions on messages |

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register    Create account
POST   /api/auth/login       Login
POST   /api/auth/refresh     Refresh access token
POST   /api/auth/logout      Logout
GET    /api/auth/me          Get current user
```

### Rooms
```
GET    /api/rooms            List all rooms
POST   /api/rooms            Create a room
GET    /api/rooms/:id        Get room + members
POST   /api/rooms/:id/join   Join a room
POST   /api/rooms/dm         Get or create a DM room
```

### Messages
```
GET    /api/messages/:roomId    Message history (cursor-paginated)
DELETE /api/messages/:id        Soft-delete a message
```

### Users
```
GET    /api/users/search?q=    Search users by username
GET    /api/users/:id          Get user profile
PATCH  /api/users/profile      Update bio/avatar
```

---

## 🎨 Design System

The entire UI is built on a CSS custom property design token system defined in `globals.css`.

### Key Color Tokens (Dark Mode)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0f` | Page background |
| `--bg-secondary` | `#111118` | Sidebar, cards |
| `--accent-primary` | `#7c6ff7` | Violet-purple accent |
| `--accent-secondary` | `#5b8af5` | Electric blue |
| `--online-color` | `#23d18b` | Presence indicators |
| `--bubble-sent-from` | `#7c6ff7` | Sent message gradient start |

### Key Animations
| Name | Effect |
|------|--------|
| `messageSlideIn` | Message bubbles slide up on entry |
| `typingBounce` | Staggered dot bounce for typing indicator |
| `presencePulse` | Radial glow pulse for online avatars |
| `reactionPop` | Spring scale for emoji reaction chips |
| `shimmer` | Loading skeleton sweep effect |
| `glowPulse` | Accent color breathing glow |

---

## 🔒 Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-random-secret-here"
JWT_REFRESH_SECRET="your-other-random-secret-here"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

---

## 📦 Available Scripts

### Backend
```bash
npm run dev          # Start dev server with hot-reload (ts-node-dev)
npm run build        # Compile TypeScript → dist/
npm run start        # Run compiled build
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (GUI database browser)
```

### Frontend
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Run production build
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ using Next.js, Socket.io, and Prisma

</div>
