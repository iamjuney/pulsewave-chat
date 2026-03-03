# ⚡ Pulsewave Chat

A **real-time chat application** powered by [SpacetimeDB](https://spacetimedb.com) — a next-gen serverless database that replaces your backend. Built with React 19, TypeScript, and Vite for a lightning-fast, modern chat experience.

> 🌐 **Live Demo**: Deployed on [Vercel](https://vercel.com) with SpacetimeDB MainCloud

---

## ✨ Features

### 💬 Messaging
- **Real-time messaging** — instant delivery powered by SpacetimeDB subscriptions
- **Message editing** — edit your sent messages with an `(edited)` indicator
- **Message deletion** — remove your own messages
- **Reply threads** — reply to specific messages with inline preview context
- **Image sharing** — send images alongside text messages
- **Message search** — search through chat history with jump-to-message navigation

### 🏠 Rooms & Conversations
- **Chat rooms** — create and join public chat rooms
- **Direct messages** — private 1-on-1 conversations
- **Default "general" room** — new users auto-join on first connection
- **Unread counts** — per-room unread message badges
- **Room membership** — join/leave rooms with member counts

### 👤 User Profiles
- **Customizable display names** — set and update your username
- **User avatars** — upload profile pictures via URL
- **User bios** — add a personal bio to your profile
- **Profile cards** — click on any user to view their profile

### 🟢 Presence & Interaction
- **Online/offline status** — real-time user presence tracking
- **Typing indicators** — see when others are typing (auto-clears after 3s)
- **Emoji reactions** — react to messages with emojis (toggle on/off)
- **System messages** — join/leave notifications in the chat

### 🔐 Authentication
- **OIDC login** — secure authentication via SpacetimeDB Auth (OpenID Connect)
- **Session persistence** — auth tokens stored in local storage
- **Login page** — clean, dedicated login UI

### 🎨 UI/UX
- **Responsive design** — desktop sidebar + mobile sheet navigation
- **Dark mode** — sleek dark-themed interface
- **Smooth animations** — fade-in, zoom-in transitions and loading states
- **Auto-scroll** — automatically scroll to the latest messages

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type-safe development |
| [Vite 7](https://vite.dev) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Accessible UI components (New York style) |
| [Radix UI](https://www.radix-ui.com) | Headless UI primitives |
| [Lucide React](https://lucide.dev) | Icon library |
| [react-oidc-context](https://github.com/authts/react-oidc-context) | OIDC authentication |

### Backend
| Technology | Purpose |
|---|---|
| [SpacetimeDB](https://spacetimedb.com) | Serverless database + real-time sync |
| SpacetimeDB TypeScript Module | Server-side logic (reducers & tables) |

### Dev Tools
| Technology | Purpose |
|---|---|
| [Vitest](https://vitest.dev) | Unit testing framework |
| [Testing Library](https://testing-library.com) | React component testing |
| [ESLint](https://eslint.org) | Code linting |
| [Prettier](https://prettier.io) | Code formatting |

### Deployment
| Technology | Purpose |
|---|---|
| [Vercel](https://vercel.com) | Frontend hosting |
| [SpacetimeDB MainCloud](https://spacetimedb.com) | Database hosting |

---

## 📁 Project Structure

```
├── index.html                 # Entry HTML
├── src/
│   ├── main.tsx               # App entry point with OIDC + SpacetimeDB providers
│   ├── App.tsx                # Main chat application component
│   ├── auth.ts                # OIDC configuration
│   ├── types.ts               # Shared TypeScript types
│   ├── index.css              # Global styles & Tailwind config
│   ├── components/
│   │   ├── ChatSidebar.tsx    # Room list & user controls
│   │   ├── ChatHeader.tsx     # Room header with actions
│   │   ├── ChatMessage.tsx    # Message bubble with reactions
│   │   ├── ChatInput.tsx      # Message composer with typing indicator
│   │   ├── RoomList.tsx       # Room listing & creation
│   │   ├── MessageSearch.tsx  # Search overlay with results
│   │   ├── UserProfileCard.tsx# Profile modal with edit support
│   │   ├── ReplyPreview.tsx   # Inline reply context
│   │   ├── LoginPage.tsx      # OIDC login screen
│   │   ├── EmptyState.tsx     # Empty room placeholder
│   │   └── ui/               # shadcn/ui components
│   ├── module_bindings/       # Auto-generated SpacetimeDB bindings
│   └── lib/                   # Utility functions
├── spacetimedb/
│   └── src/
│       └── index.ts           # Server module (tables, reducers, lifecycle)
├── spacetime.json             # SpacetimeDB project config
├── components.json            # shadcn/ui config
└── vercel.json                # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18+) or [Bun](https://bun.sh)
- [SpacetimeDB CLI](https://spacetimedb.com/docs/getting-started)

### Installation

```bash
# Clone the repository
git clone https://github.com/iamjuney/chat-react-spacetimedb.git
cd chat-react-spacetimedb

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SPACETIMEDB_HOST=ws://localhost:3000
VITE_SPACETIMEDB_DB_NAME=quickstart-chat
VITE_SPACETIMEAUTH_CLIENT_ID=YOUR_CLIENT_ID
```

### Running Locally

```bash
# Publish the SpacetimeDB module locally
npm run spacetime:publish:local

# Generate TypeScript bindings
npm run spacetime:generate

# Start the dev server
npm run dev
```

### Deploying to MainCloud

```bash
# Publish the module to SpacetimeDB MainCloud
npm run spacetime:publish

# Build for production
npm run build
```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run test` | Run unit tests with Vitest |
| `npm run lint` | Lint and format check |
| `npm run format` | Auto-format with Prettier |
| `npm run spacetime:generate` | Generate TypeScript bindings from the module |
| `npm run spacetime:publish:local` | Publish module to local SpacetimeDB |
| `npm run spacetime:publish` | Publish module to MainCloud |

---

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).

---

<p align="center">
  Built with ❤️ using <a href="https://spacetimedb.com">SpacetimeDB</a> + <a href="https://react.dev">React</a>
</p>
