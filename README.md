# 🍔 Burger Bonanza

A fun web application to track your burger eating challenge! Built with Nuxt 3 and Supabase.

## Features

- **User Authentication**: Magic link and OAuth login via Supabase
- **Entry Tracking**: Log daily burger consumption with photos and ratings
- **Leaderboard**: See who's eating the most burgers
- **Statistics**: View cumulative progress charts over time
- **Photo Upload**: Share photos of your burger adventures
- **Challenge Window**: Enforced date range (Sep 1, 2025 - Aug 31, 2026)

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Charts**: Chart.js + Vue-ChartJS
- **Validation**: Zod
- **Deployment**: Vercel

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Supabase Database**:
   - Create a new Supabase project at https://supabase.com
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the entire contents of `supabase-setup.sql` 
   - Click "Run" to execute the SQL setup
   - This creates all tables, indexes, RLS policies, and functions needed

3. **Setup Supabase Storage**:
   - Go to Storage in your Supabase dashboard
   - Click "Create new bucket"
   - Name it: `burger-photos`
   - Make it **Public** (important!)
   - Click "Create bucket"

4. **Setup Storage Policies** (Important for photo uploads):
   - Go to Storage > Policies
   - Create a new policy for the `burger-photos` bucket
   - Policy name: "Allow authenticated uploads"
   - Allowed operation: INSERT
   - Target roles: authenticated
   - Policy definition: `auth.uid() IS NOT NULL`

5. **Environment variables**:
   ```bash
   cp .env.example .env
   # Add your Supabase Project URL and anon (public) key
   ```
   Your `.env` should look like:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your-anon-public-key-here
   ```

6. **Run development server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

If you get "row violates row-level security policy" errors:
1. Make sure you ran the complete `supabase-setup.sql` file
2. Ensure your user is authenticated 
3. Check that RLS policies are properly set up in Supabase dashboard

If photo uploads fail:
1. Ensure the `burger-photos` bucket is created and public
2. Set up the storage policy as described in step 4 above

## Database Schema

The app uses two main tables:
- `users`: User profiles synced from Supabase Auth
- `entries`: Burger consumption entries with date validation

See `plan.md` for the complete SQL schema.

## Deployment

1. **Vercel**: Push to GitHub and connect to Vercel
2. **Environment**: Set `SUPABASE_URL` and `SUPABASE_KEY` in Vercel
3. **Build**: Automatic deployment on push

## Contributing

This is a fun personal project! Feel free to fork and customize for your own challenges.