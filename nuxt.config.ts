export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss"],
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