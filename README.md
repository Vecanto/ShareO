# ShareO — Instant File Transfer

Dead-simple, no-signup file sharing. Upload a file, get a link, share it. Files expire automatically in 24 hours.

**Live:** _add your deployment URL here_

---

## Features

- **No accounts** — upload and share instantly
- **Password protection** — optional bcrypt-hashed password per file
- **Brute-force lockout** — 3 failed attempts locks the file for 30 minutes
- **Auto-expiry** — files and metadata are deleted after 24 hours
- **Supabase Storage** — cloud-native file storage, no local disk dependency
- **Dangerous file blocking** — `.exe`, `.bat`, `.sh`, `.ps1`, `.py`, `.jar`, and more are rejected
- **Rate limiting** — 100 req / 15 min, 20 uploads / hr per IP

---

## Tech Stack

| Layer    | Technology                                     |
|----------|------------------------------------------------|
| Frontend | Next.js 15+, React 19, Vanilla CSS             |
| Backend  | Next.js API Routes                             |
| Storage  | Supabase Storage                               |
| Database | better-sqlite3 (file metadata)                 |
| Auth     | bcrypt password hashing                        |
| Security | Helmet headers, express-rate-limit, UUID v4    |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/shareo-nextjs.git
cd shareo-nextjs
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
FILE_EXPIRY_HOURS=24
LOCKOUT_DURATION_MINUTES=30
MAX_FILE_SIZE_MB=100

# Optional — enables the contact form (get endpoint from formspree.io)
FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id
```

### 3. Set up Supabase Storage

1. Go to your [Supabase dashboard](https://supabase.com)
2. Navigate to **Storage** → **New Bucket**
3. Create a bucket named exactly **`uploads`**
4. The Service Role Key bypasses all RLS — no additional policies needed

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add all environment variables from your `.env` in the Vercel dashboard
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain (e.g. `https://shareo.vercel.app`)
5. Deploy

> **Note:** The SQLite database (`server/data/shareo.db`) is ephemeral on serverless platforms. For production at scale, migrate to a persistent database like Supabase Postgres or PlanetScale.

---

## Project Structure

```
shareo-nextjs/
├── app/
│   ├── api/
│   │   ├── upload/       # POST — upload file to Supabase
│   │   ├── download/     # GET  — stream file from Supabase
│   │   ├── meta/         # GET  — file metadata
│   │   ├── verify/       # POST — password verification
│   │   └── contact/      # POST — contact form
│   ├── about/            # Documentation page
│   ├── connect/          # Contact page
│   ├── download/[id]/    # File download page
│   ├── layout.tsx
│   ├── page.tsx          # Home / upload
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── TransferZone.tsx  # Upload UI
│   ├── DownloadPage.tsx  # Download UI
│   ├── About.tsx
│   └── Connect.tsx
└── lib/
    ├── supabase.ts       # Supabase client
    ├── db.ts             # SQLite connection
    ├── fileStore.ts      # File CRUD
    ├── hash.ts           # bcrypt helpers
    ├── lockout.ts        # Brute-force logic
    └── utils.ts          # Formatters
```

---

## License

MIT
