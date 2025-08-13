<script setup lang="ts">
const { fetchRecent } = useEntries()
const { fetchLeaderboard } = useLeaderboard()
const user = useSupabaseUser()

const recent = ref<any[]>([])
const leaderboard = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { syncUser } = useUserSync()
    await syncUser()
    
    const [r, l] = await Promise.all([
      fetchRecent(50),
      fetchLeaderboard()
    ])
    recent.value = r
    leaderboard.value = l
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🍔 Burger Bonanza</h1>
        <p class="text-gray-600">Track your burger eating challenge!</p>
        <div class="flex justify-center gap-4 mt-4">
          <NuxtLink 
            to="/entry/new" 
            class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold flex items-center gap-2"
          >
            <span>🍔</span>
            Add New Entry
          </NuxtLink>
          <NuxtLink 
            to="/stats" 
            class="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            📊 View Stats
          </NuxtLink>
          <button 
            @click="$supabase.auth.signOut()" 
            class="text-gray-600 hover:text-gray-800 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div v-if="loading" class="text-center py-12">
        <div class="text-4xl mb-4">🍔</div>
        <div class="text-gray-600">Loading your burger data...</div>
      </div>

      <div v-else class="grid lg:grid-cols-5 xl:grid-cols-3 gap-8">
        <div class="lg:col-span-3 xl:col-span-2 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Recent Entries</h2>
            <div class="text-sm text-gray-500">
              {{ recent.length }} entries shown
            </div>
          </div>
          
          <div v-if="recent.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div class="text-6xl mb-4">🍔</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No entries yet!</h3>
            <p class="text-gray-500 mb-6">Be the first to start tracking your burger challenge.</p>
            <NuxtLink 
              to="/entry/new"
              class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold inline-flex items-center gap-2"
            >
              <span>🍔</span>
              Add Your First Entry
            </NuxtLink>
          </div>
          
          <EntryCard v-for="entry in recent" :key="entry.id" :entry="entry" />
        </div>

        <div class="lg:col-span-2 xl:col-span-1 space-y-6">
          <LeaderboardTable :rows="leaderboard" />
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Challenge Info</h3>
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>Challenge Period:</span>
                <span class="font-medium">Sep 1, 2025 - Aug 31, 2026</span>
              </div>
              <div class="flex justify-between">
                <span>Max per entry:</span>
                <span class="font-medium">50 burgers 🍔</span>
              </div>
              <div class="flex justify-between">
                <span>Rating scale:</span>
                <span class="font-medium">1-5 stars ⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>