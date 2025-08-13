export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss"],
  css: ["~/assets/tailwind.css"],
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/",
      exclude: ["/login"]
    },
    clientOptions: {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        storage: process.client ? window.localStorage : undefined,
        storageKey: 'burger-bonanza-auth'
      }
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
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'format-detection', content: 'telephone=no' }
      ]
    }
  }
})