# Team Manager — Project Structure

## Directory layout

```
team-manager/
├── prisma/
│   ├── schema.prisma          # DB models (Team, Player, Game, PlayEvent…)
│   ├── migrations/            # Auto-generated migration history
│   └── seed.ts                # Dev seed data
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Route group — unauthenticated layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/       # Route group — authenticated layout
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── roster/
│   │   │   │   └── page.tsx
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx
│   │   │   ├── lineup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx     # Nav + auth guard
│   │   │
│   │   ├── scorebook/
│   │   │   └── [gameId]/
│   │   │       └── page.tsx   # Full-screen live scorebook
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   ├── teams/
│   │   │   │   └── route.ts
│   │   │   ├── players/
│   │   │   │   ├── route.ts   # GET all, POST create
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts  # GET, PATCH, DELETE
│   │   │   ├── games/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── events/
│   │   │   │           └── route.ts  # Live play events
│   │   │   └── lineup/
│   │   │       └── route.ts
│   │   │
│   │   ├── globals.css        # Tailwind v4 theme + base styles
│   │   └── layout.tsx         # Root layout (FA CSS, fonts)
│   │
│   ├── components/
│   │   ├── ui/                # Reusable design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Nav.tsx
│   │   │   └── PageHeader.tsx
│   │   │
│   │   ├── roster/
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── AddPlayerForm.tsx
│   │   │   └── RosterTable.tsx
│   │   │
│   │   ├── schedule/
│   │   │   ├── GameCard.tsx
│   │   │   └── AddGameForm.tsx
│   │   │
│   │   ├── lineup/
│   │   │   ├── LineupBuilder.tsx
│   │   │   └── DraggablePlayer.tsx
│   │   │
│   │   └── scorebook/
│   │       ├── ScorePanel.tsx
│   │       ├── FoulTracker.tsx
│   │       ├── PlayLog.tsx
│   │       └── PeriodControl.tsx
│   │
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config + helpers
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── fontawesome.ts     # FA library registration
│   │   ├── utils.ts           # cn() and misc helpers
│   │   ├── validations.ts     # Zod schemas (shared client+server)
│   │   └── pusher.ts          # Pusher server + client instances
│   │
│   ├── server/
│   │   ├── queries/           # DB query functions (used in RSC)
│   │   │   ├── players.ts
│   │   │   ├── games.ts
│   │   │   └── team.ts
│   │   └── actions/           # Next.js Server Actions
│   │       ├── players.ts
│   │       ├── games.ts
│   │       └── scorebook.ts
│   │
│   ├── store/
│   │   └── scorebook.ts       # Zustand — live game state
│   │
│   ├── hooks/
│   │   ├── useScorebook.ts    # Scorebook actions + Pusher sync
│   │   ├── usePlayers.ts      # TanStack Query wrappers
│   │   └── useGames.ts
│   │
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types + Prisma re-exports
│   │
│   └── tests/
│       ├── setup.ts           # Vitest global setup
│       ├── unit/              # Unit tests (lib, server actions)
│       └── e2e/               # Playwright tests
│           ├── auth.spec.ts
│           └── scorebook.spec.ts
│
├── .env.example               # All required env vars documented
├── .env.local                 # Your local secrets (git-ignored)
├── .eslintrc.mjs
├── .prettierrc
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.example .env.local

# 3. Generate Prisma client
npm run db:generate

# 4. Run migrations (creates tables)
npm run db:migrate

# 5. Seed dev data (optional)
npm run db:seed

# 6. Start dev server
npm run dev
```

## Stack at a glance

| Concern         | Tool                        |
|-----------------|-----------------------------|
| Framework       | Next.js 15 (App Router)     |
| Styling         | Tailwind CSS v4 + shadcn/ui |
| Icons           | Font Awesome 6 (React)      |
| Auth            | NextAuth v5                 |
| Database        | Prisma + Neon Postgres      |
| Caching         | Upstash Redis               |
| Real-time       | Pusher Channels             |
| Client state    | Zustand                     |
| Data fetching   | TanStack Query v5           |
| Validation      | Zod                         |
| Testing         | Vitest + Playwright         |
| Linting         | ESLint + Prettier + Husky   |
| Deploy          | Vercel                      |
