# Bookroom

Your cozy personal library. Track what you read, what you love, and what's next.

**🌐 Live: [mybookroom.vercel.app](https://mybookroom.vercel.app)**

## Screenshots

### Room Scene

![Room Day](docs/room-day.png)

![Room Night](docs/room-night.png)

### Login Screen

![Auth Day](docs/auth-day.png)

![Auth Night](docs/auth-night.png)

### Collection Board

![Collection Day](docs/collection-day.png)

![Collection Night](docs/collection-night.png)

## Features

- **Interactive Pixel-Art Room** — Navigate your library through a cozy room with clickable hotspots
- **Kanban Board** — Drag-and-drop book management with reading status columns
- **Reading Statuses** — Plan to Read, Reading, On Hold, Dropped, Completed, Re-Reading
- **Bookmarks** — Save up to 5 quick-access book slots
- **Notes & Ratings** — Add personal notes and rate books 1-5 stars
- **Reading Stats** — Track your reading progress and statistics
- **Dark/Light Mode** — Day/night theme toggle with persistent preference
- **Password Reset** — Email-based password recovery via Resend
- **Responsive Design** — Works on desktop and mobile

## Tech Stack

| Technology      | Purpose                            |
| --------------- | ---------------------------------- |
| Next.js 16      | React framework (App Router)       |
| React 19        | UI library                         |
| TypeScript      | Type safety                        |
| Tailwind CSS v4 | Utility-first styling              |
| PostgreSQL      | Database (via Neon)                |
| Prisma v7       | ORM with driver adapter            |
| NextAuth v4     | Authentication (credentials + JWT) |
| @dnd-kit        | Drag-and-drop functionality        |
| Resend          | Email delivery                     |
| Sass            | Component styling                  |

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/FelixFer/bookroom.git
cd bookroom
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

4. **Set up the database** (see [Setting Up the Database](#setting-up-the-database-neon) below)

5. **Generate Prisma client**

```bash
npm run prisma:generate
```

6. **Run database migrations**

```bash
npm run prisma:migrate
```

7. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Up the Database (Neon)

Bookroom uses [Neon](https://neon.tech) for serverless PostgreSQL. Neon offers a generous free tier that's perfect for personal projects.

### Step 1: Create a Neon Account

1. Go to [neon.tech](https://neon.tech) and sign up (you can use GitHub, Google, or email)
2. Verify your email address

### Step 2: Create a Project

1. Click "New Project" in the Neon console
2. Give it a name (e.g., "bookroom")
3. Select a region close to you
4. Click "Create Project"

### Step 3: Get Connection Strings

After creating the project, Neon will show you connection details. You need two connection strings:

- **Connection string (pooler)** — Used for `DATABASE_URL` (with connection pooling)
- **Connection string (direct)** — Used for `DIRECT_URL` (for migrations)

Both can be found in the "Connection Details" section. The pooler URL includes `-pooler` in the hostname.

### Step 4: Configure Environment Variables

Open your `.env` file and replace the placeholders:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DATABASE?sslmode=verify-full&channel_binding=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DATABASE?sslmode=verify-full&channel_binding=require"
```

Replace:

- `USER` — Your database username
- `PASSWORD` — Your database password
- `HOST-pooler.REGION.aws.neon.tech` — Your pooler hostname (for DATABASE_URL)
- `HOST.REGION.aws.neon.tech` — Your direct hostname (for DIRECT_URL)
- `DATABASE` — Your database name (usually "neondb")

### Step 5: Run Migrations

```bash
npm run prisma:migrate
```

This creates all the necessary tables in your Neon database.

## Environment Variables

| Variable          | Description                                                  | Required                                |
| ----------------- | ------------------------------------------------------------ | --------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string (pooler)                        | Yes                                     |
| `DIRECT_URL`      | PostgreSQL connection string (direct, for migrations)        | Yes                                     |
| `NEXTAUTH_SECRET` | Random string for NextAuth JWT encryption                    | Yes                                     |
| `RESEND_API_KEY`  | API key from [Resend](https://resend.com) for email delivery | Yes                                     |
| `EMAIL_FROM`      | Sender email address for password reset emails               | No (defaults to `noreply@bookroom.app`) |

## Available Scripts

| Script                    | Description                       |
| ------------------------- | --------------------------------- |
| `npm run dev`             | Start development server          |
| `npm run build`           | Build for production              |
| `npm run start`           | Start production server           |
| `npm run lint`            | Run ESLint                        |
| `npm run prisma:generate` | Generate Prisma client            |
| `npm run prisma:migrate`  | Run database migrations           |
| `npm run prisma:seed`     | Seed database with sample data    |
| `npm run prisma:studio`   | Open Prisma Studio (database GUI) |

## License

MIT © Felix Ferdinand
