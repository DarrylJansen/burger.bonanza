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
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-500 to-red-600">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      <div class="absolute top-40 left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
    </div>
    
    <div class="relative max-w-md w-full mx-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      <!-- Header with emoji background -->
      <div class="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6 text-center relative">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative">
          <div class="text-4xl mb-2">🍔</div>
          <h1 class="text-2xl font-bold text-white">Burger Bonanza</h1>
          <p class="text-orange-100 text-sm mt-1">Track your burger eating challenge!</p>
        </div>
      </div>
      
      <!-- Form content -->
      <div class="px-8 py-8 space-y-6">
        <div class="text-center">
          <p class="text-gray-600 text-sm">Sign in to start tracking your burger journey</p>
        </div>
        
        <div class="space-y-4">
          <div class="relative">
            <input 
              v-model="email" 
              type="email" 
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400" 
              placeholder="Enter your email address"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          
          <button 
            class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            :disabled="!email || loading" 
            @click="loginWithEmail"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Magic Link...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              ✨ Send Magic Link
            </span>
          </button>
          
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-3 bg-white text-gray-500 font-medium">OR CONTINUE WITH</span>
            </div>
          </div>
          
          <button 
            class="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
            @click="loginWithGoogle"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
        
        <div class="text-center">
          <p class="text-xs text-gray-500">
            By signing in, you agree to participate in the ultimate burger challenge!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>