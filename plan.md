Heck yes—“Burger Bonanza” is a perfect little Nuxt app! Here’s a tight plan you can follow from zero → deployed on Vercel, with Supabase for auth, database, and image storage. I’ll include directory layout, schema, API routes, UI flow, and copy-pasteable snippets (4-space indents).

Tech stack (simple + deployable)
Nuxt 3 (Vue 3 + Nitro server on Vercel)

@nuxtjs/supabase for:

Auth (email magic links or OAuth like Google)

Postgres DB (managed by Supabase)

Storage bucket for photos

Validation: zod

Charts: vue-chartjs + chart.js

Styling: Tailwind (or UnoCSS), pick one; I’ll assume Tailwind

Dates & TZ: dayjs

Deployment: Vercel (edge/serverless friendly)

Challenge window: 2025-09-01 → 2026-08-31 (365 days). We’ll enforce this in both client validation and DB policies.

Data model (Supabase)
Tables
users

id uuid primary key default auth.uid()

display_name text not null

avatar_url text

created_at timestamptz default now()

entries

id uuid primary key default gen_random_uuid()

user_id uuid not null references users(id) on delete cascade

entry_date date not null ← must be within challenge window

amount integer not null check (amount > 0 and amount <= 50)

stars integer not null check (stars >= 1 and stars <= 5)

photo_url text

note text

created_at timestamptz default now()

indexes

create index on entries (user_id, entry_date desc);

create index on entries (entry_date desc);

view (optional, for leaderboard)

leaderboard_view(user_id, total, first_entry, last_entry)

total = sum(amount)

Use to rank users quickly

SQL (run in Supabase SQL editor)
pgsql
Copy
Edit
-- users
create table if not exists public.users (
    id uuid primary key default auth.uid(),
    display_name text not null,
    avatar_url text,
    created_at timestamptz default now()
);

-- entries
create table if not exists public.entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    entry_date date not null,
    amount integer not null check (amount > 0 and amount <= 50),
    stars integer not null check (stars between 1 and 5),
    photo_url text,
    note text,
    created_at timestamptz default now()
);

create index if not exists idx_entries_user_date on public.entries (user_id, entry_date desc);
create index if not exists idx_entries_date on public.entries (entry_date desc);

-- Challenge window constraint (server-side guard)
create or replace function public.is_within_bonanza_window(d date)
returns boolean language sql immutable as $$
    select d between date '2025-09-01' and date '2026-08-31'
$$;

alter table public.entries
    add constraint entries_date_in_window check (public.is_within_bonanza_window(entry_date));

-- Leaderboard view
create or replace view public.leaderboard_view as
select
    u.id as user_id,
    u.display_name,
    coalesce(sum(e.amount), 0) as total,
    min(e.entry_date) as first_entry,
    max(e.entry_date) as last_entry
from public.users u
left join public.entries e on e.user_id = u.id
group by u.id, u.display_name;

-- RLS
alter table public.users enable row level security;
alter table public.entries enable row level security;

-- Users: a user can see everyone (for names/avatars/leaderboard), but only update self
create policy "users read all" on public.users for select using (true);
create policy "users insert self" on public.users for insert with check (auth.uid() = id);
create policy "users update self" on public.users for update using (auth.uid() = id);

-- Entries: anyone can read (feed/leaderboard), only owner can write
create policy "entries read all" on public.entries for select using (true);
create policy "entries insert own" on public.entries for insert with check (auth.uid() = user_id);
create policy "entries update own" on public.entries for update using (auth.uid() = user_id);
create policy "entries delete own" on public.entries for delete using (auth.uid() = user_id);

-- Storage bucket for photos
-- In Supabase Storage create bucket: 'burger-photos' (public = true)
Nuxt app structure
pgsql
Copy
Edit
burger-bonanza/
├─ .env.local
├─ nuxt.config.ts
├─ app.config.ts
├─ middleware/
│   └─ auth.global.ts
├─ server/
│   └─ api/
│       ├─ stats.get.ts          (aggregate endpoints if needed)
│       └─ me.sync.post.ts       (ensures user row exists)
├─ composables/
│   ├─ useBonanzaWindow.ts
│   ├─ useEntries.ts
│   └─ useLeaderboard.ts
├─ pages/
│   ├─ index.vue                 (feed + leaderboard)
│   ├─ login.vue
│   ├─ entry/
│   │   └─ new.vue               (create)
│   ├─ profile.vue
│   └─ stats.vue
├─ components/
│   ├─ EntryCard.vue
│   ├─ EntryForm.vue
│   ├─ LeaderboardTable.vue
│   └─ CumulativeChart.vue
├─ plugins/
│   └─ supabase-init.client.ts
├─ assets/
│   └─ tailwind.css
└─ package.json
Install & configure
bash
Copy
Edit
# Create Nuxt app
npx nuxi@latest init burger-bonanza
cd burger-bonanza

# Add deps
pnpm add @nuxtjs/supabase zod dayjs chart.js vue-chartjs
pnpm add -D tailwindcss postcss autoprefixer

# Tailwind
npx tailwindcss init -p
tailwind.config.js

js
Copy
Edit
export default {
    content: [
        "./components/**/*.{vue,js,ts}",
        "./layouts/**/*.{vue,js,ts}",
        "./pages/**/*.{vue,js,ts}",
        "./app.vue",
        "./plugins/**/*.{js,ts}"
    ],
    theme: { extend: {} },
    plugins: []
}
assets/tailwind.css

css
Copy
Edit
@tailwind base;
@tailwind components;
@tailwind utilities;
nuxt.config.ts

ts
Copy
Edit
export default defineNuxtConfig({
    modules: ["@nuxtjs/supabase"],
    css: ["~/assets/tailwind.css"],
    supabase: {
        redirectOptions: {
            login: "/login",
            callback: "/",
            exclude: ["/login"]
        }
    },
    nitro: {
        preset: "vercel"
    },
    runtimeConfig: {
        public: {
            bonanzaStart: "2025-09-01",
            bonanzaEnd: "2026-08-31",
            supabaseBucket: "burger-photos"
        }
    }
})
.env.local

ini
Copy
Edit
SUPABASE_URL=...your supabase url...
SUPABASE_KEY=...anon public key...
Auth flow
Use @nuxtjs/supabase’s built-in UI helpers.

On first sign-in, call /api/me.sync to upsert the users row (so profile exists for leaderboard).

pages/login.vue

vue
Copy
Edit
<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const loading = ref(false)
const email = ref("")

watch(user, (u) => { if (u) navigateTo("/") })

async function loginWithEmail() {
    loading.value = true
    await supabase.auth.signInWithOtp({ email: email.value })
    loading.value = false
    alert("Check your email for the magic link.")
}

async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google" })
}
</script>

<template>
    <div class="max-w-md mx-auto p-6 space-y-4">
        <h1 class="text-2xl font-bold">Burger Bonanza Login</h1>
        <input v-model="email" type="email" class="input input-bordered w-full" placeholder="you@example.com" />
        <button class="btn btn-primary w-full" :disabled="!email || loading" @click="loginWithEmail">
            Email Magic Link
        </button>
        <div class="text-center text-sm text-gray-500">or</div>
        <button class="btn w-full" @click="loginWithGoogle">Sign in with Google</button>
    </div>
</template>
server/api/me.sync.post.ts

ts
Copy
Edit
export default defineEventHandler(async (event) => {
    const client = serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const { data: existing } = await client
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

    if (!existing) {
        await client.from("users").insert({
            id: user.id,
            display_name: user.user_metadata?.full_name || user.email?.split("@")[0],
            avatar_url: user.user_metadata?.avatar_url || null
        })
    }
    return { ok: true }
})
middleware/auth.global.ts

ts
Copy
Edit
export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser()
    if (!user.value && to.path !== "/login") {
        return navigateTo("/login")
    }
})
Challenge window helper
composables/useBonanzaWindow.ts

ts
Copy
Edit
export function useBonanzaWindow() {
    const config = useRuntimeConfig().public
    const start = new Date(config.bonanzaStart)
    const end = new Date(config.bonanzaEnd)
    function isWithin(date: Date) {
        return date >= start && date <= end
    }
    return { start, end, isWithin }
}
Create an entry (form + upload to Supabase Storage)
components/EntryForm.vue

vue
Copy
Edit
<script setup lang="ts">
import { z } from "zod"
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const config = useRuntimeConfig().public
const { isWithin } = useBonanzaWindow()

const schema = z.object({
    entry_date: z.string().refine(v => isWithin(new Date(v)), "Date must be within the challenge window"),
    amount: z.number().int().min(1).max(50),
    stars: z.number().int().min(1).max(5),
    note: z.string().max(500).optional()
})

const form = reactive({
    entry_date: new Date().toISOString().slice(0, 10),
    amount: 1,
    stars: 4,
    note: "",
    file: null as File | null
})

const submitting = ref(false)
const error = ref<string | null>(null)

async function submit() {
    error.value = null
    const parsed = schema.safeParse({
        entry_date: form.entry_date,
        amount: Number(form.amount),
        stars: Number(form.stars),
        note: form.note || undefined
    })
    if (!parsed.success) {
        error.value = parsed.error.errors[0].message
        return
    }
    submitting.value = true
    let photo_url: string | null = null

    if (form.file) {
        const path = `${user.value?.id}/${Date.now()}_${form.file.name}`
        const { error: upErr } = await supabase.storage.from(config.supabaseBucket).upload(path, form.file, {
            cacheControl: "3600",
            upsert: false
        })
        if (upErr) {
            error.value = upErr.message
            submitting.value = false
            return
        }
        const { data: pub } = supabase.storage.from(config.supabaseBucket).getPublicUrl(path)
        photo_url = pub.publicUrl
    }

    const { error: insErr } = await supabase.from("entries").insert({
        user_id: user.value?.id,
        entry_date: form.entry_date,
        amount: Number(form.amount),
        stars: Number(form.stars),
        note: form.note || null,
        photo_url
    })

    submitting.value = false
    if (insErr) {
        error.value = insErr.message
        return
    }
    navigateTo("/")
}
</script>

<template>
    <form @submit.prevent="submit" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
            <label class="block">Date
                <input v-model="form.entry_date" type="date" class="input input-bordered w-full" />
            </label>
            <label class="block">Amount
                <input v-model.number="form.amount" type="number" min="1" max="50" class="input input-bordered w-full" />
            </label>
            <label class="block">Stars
                <input v-model.number="form.stars" type="number" min="1" max="5" class="input input-bordered w-full" />
            </label>
            <label class="block col-span-2">Optional photo
                <input type="file" accept="image/*" @change="e => form.file = (e.target as HTMLInputElement).files?.[0] || null" />
            </label>
            <label class="block col-span-2">Note
                <textarea v-model="form.note" class="textarea textarea-bordered w-full" rows="3" maxlength="500" />
            </label>
        </div>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <button class="btn btn-primary" :disabled="submitting">Save entry</button>
    </form>
</template>
pages/entry/new.vue

vue
Copy
Edit
<script setup lang="ts">
onMounted(async () => { await $fetch("/api/me.sync", { method: "POST" }) })
</script>

<template>
    <div class="max-w-xl mx-auto p-6 space-y-4">
        <h1 class="text-2xl font-bold">New Burger Entry</h1>
        <EntryForm />
    </div>
</template>
Recent feed + Leaderboard
composables/useEntries.ts

ts
Copy
Edit
export function useEntries() {
    const supabase = useSupabaseClient()
    async function fetchRecent(limit = 30) {
        const { data, error } = await supabase
            .from("entries")
            .select("id, entry_date, amount, stars, note, photo_url, user_id, users(display_name, avatar_url)")
            .order("entry_date", { ascending: false })
            .limit(limit)
        if (error) throw error
        return data
    }
    return { fetchRecent }
}
composables/useLeaderboard.ts

ts
Copy
Edit
export function useLeaderboard() {
    const supabase = useSupabaseClient()
    async function fetchLeaderboard() {
        const { data, error } = await supabase
            .from("leaderboard_view")
            .select("*")
            .order("total", { ascending: false })
        if (error) throw error
        return data
    }
    return { fetchLeaderboard }
}
components/EntryCard.vue

vue
Copy
Edit
<script setup lang="ts">
defineProps<{
    entry: {
        id: string
        entry_date: string
        amount: number
        stars: number
        note?: string | null
        photo_url?: string | null
        users: { display_name: string; avatar_url?: string | null } | null
    }
}>()
</script>

<template>
    <div class="rounded-xl border p-4 space-y-2">
        <div class="flex items-center gap-3">
            <img v-if="entry.users?.avatar_url" :src="entry.users.avatar_url" class="w-8 h-8 rounded-full" />
            <div class="font-semibold">{{ entry.users?.display_name || "Unknown" }}</div>
            <div class="ml-auto text-sm text-gray-500">{{ entry.entry_date }}</div>
        </div>
        <div class="text-sm">
            🍔 <b>{{ entry.amount }}</b> · ⭐ {{ entry.stars }}
        </div>
        <div v-if="entry.note" class="text-sm text-gray-700">{{ entry.note }}</div>
        <img v-if="entry.photo_url" :src="entry.photo_url" class="rounded-lg max-h-72 object-cover" />
    </div>
</template>
components/LeaderboardTable.vue

vue
Copy
Edit
<script setup lang="ts">
defineProps<{ rows: Array<{ user_id: string; display_name: string; total: number }> }>()
</script>

<template>
    <table class="w-full border rounded-lg overflow-hidden">
        <thead class="bg-gray-50">
            <tr>
                <th class="text-left p-2">#</th>
                <th class="text-left p-2">Player</th>
                <th class="text-right p-2">Total 🍔</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(r, i) in rows" :key="r.user_id" class="border-t">
                <td class="p-2">{{ i + 1 }}</td>
                <td class="p-2">{{ r.display_name }}</td>
                <td class="p-2 text-right font-semibold">{{ r.total }}</td>
            </tr>
        </tbody>
    </table>
</template>
pages/index.vue

vue
Copy
Edit
<script setup lang="ts">
const { fetchRecent } = useEntries()
const { fetchLeaderboard } = useLeaderboard()

const recent = ref<any[]>([])
const leaderboard = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
    const [r, l] = await Promise.all([
        fetchRecent(50),
        fetchLeaderboard()
    ])
    recent.value = r
    leaderboard.value = l
    loading.value = false
})
</script>

<template>
    <div class="max-w-5xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold">Recent Entries</h1>
                <NuxtLink class="btn btn-primary" to="/entry/new">+ New</NuxtLink>
            </div>
            <div v-if="loading">Loading…</div>
            <EntryCard v-for="e in recent" :key="e.id" :entry="e" />
        </div>
        <div class="space-y-4">
            <h2 class="text-xl font-bold">Leaderboard</h2>
            <LeaderboardTable :rows="leaderboard" />
            <NuxtLink class="text-sm underline" to="/stats">See graphs →</NuxtLink>
        </div>
    </div>
</template>
Graphs (totals + cumulative over time)
components/CumulativeChart.vue

vue
Copy
Edit
<script setup lang="ts">
import { Line } from "vue-chartjs"
import {
    Chart, Title, Tooltip, Legend, LineElement,
    LinearScale, PointElement, CategoryScale
} from "chart.js"
Chart.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale)

defineProps<{
    labels: string[]            // date strings
    datasets: Array<{ label: string; data: number[] }>
}>()
</script>

<template>
    <div class="p-4 border rounded-xl">
        <Line :data="{ labels, datasets }" :options="{ responsive: true, maintainAspectRatio: false }" height="320" />
    </div>
</template>
pages/stats.vue

vue
Copy
Edit
<script setup lang="ts">
const supabase = useSupabaseClient()

// Build per-user cumulative series across the window
const labels = ref<string[]>([])
const datasets = ref<any[]>([])

async function load() {
    // Pull all entries in window
    const { data, error } = await supabase
        .from("entries")
        .select("user_id, entry_date, amount, users(display_name)")
        .order("entry_date", { ascending: true })
    if (error) throw error

    // Build date axis (every day in the window)
    const { start, end } = useBonanzaWindow()
    const days: string[] = []
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
        days.push(d.toISOString().slice(0, 10))
    }
    labels.value = days

    // Group by user
    const byUser = new Map<string, { name: string; map: Record<string, number> }>()
    for (const row of data) {
        const id = row.user_id
        const name = row.users?.display_name || "Player"
        if (!byUser.has(id)) byUser.set(id, { name, map: {} })
        byUser.get(id)!.map[row.entry_date] = (byUser.get(id)!.map[row.entry_date] || 0) + row.amount
    }

    // Cumulative arrays
    datasets.value = Array.from(byUser.entries()).map(([id, { name, map }]) => {
        let sum = 0
        const series = days.map(d => {
            sum += (map[d] || 0)
            return sum
        })
        return { label: name, data: series }
    })
}

onMounted(load)
</script>

<template>
    <div class="max-w-5xl mx-auto p-6 space-y-4">
        <h1 class="text-2xl font-bold">Stats & Graphs</h1>
        <CumulativeChart :labels="labels" :datasets="datasets" />
    </div>
</template>
Small but important details
Rate limiting: add minimal throttle on create entry (per user, e.g., max 5 per minute).

Image size: client-side limit (e.g., 4–6 MB), compress if needed (optional).

Data integrity: server-side check constraint + RLS already protect you.

Time zones: store only date (no time) to avoid TZ headaches.

Moderation: optional—let owners delete their own entries.

server/api/stats.get.ts (optional, for server-computed totals)

ts
Copy
Edit
export default defineEventHandler(async (event) => {
    const client = serverSupabaseClient(event)
    const { data, error } = await client
        .from("leaderboard_view")
        .select("*")
        .order("total", { ascending: false })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data
})
Deployment (Vercel)
Push to GitHub.

Create Supabase project → copy SUPABASE_URL and anon key; run the SQL above; create burger-photos storage bucket (public).

Vercel → New Project → Import repo.

Add env vars in Vercel:

SUPABASE_URL, SUPABASE_KEY

Build (Nuxt preset already set to vercel).

First login via email/OAuth, which triggers /api/me.sync.