<script setup lang="ts">
const supabase = useSupabaseClient()

const labels = ref<string[]>([])
const datasets = ref<any[]>([])
const loading = ref(true)

async function loadStats() {
  try {
    const { data, error } = await supabase
      .from("entries")
      .select("user_id, entry_date, amount, users(display_name)")
      .order("entry_date", { ascending: true })
      
    if (error) throw error

    const { start, end } = useBonanzaWindow()
    const days: string[] = []
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
      days.push(d.toISOString().slice(0, 10))
    }
    labels.value = days

    const byUser = new Map<string, { name: string; map: Record<string, number> }>()
    for (const row of data) {
      const id = row.user_id
      const name = row.users?.display_name || "Player"
      if (!byUser.has(id)) byUser.set(id, { name, map: {} })
      byUser.get(id)!.map[row.entry_date] = (byUser.get(id)!.map[row.entry_date] || 0) + row.amount
    }

    const colors = [
      'rgb(249, 115, 22)', // orange-500
      'rgb(239, 68, 68)',  // red-500
      'rgb(59, 130, 246)', // blue-500
      'rgb(16, 185, 129)', // emerald-500
      'rgb(139, 92, 246)', // violet-500
      'rgb(236, 72, 153)', // pink-500
    ]

    datasets.value = Array.from(byUser.entries()).map(([id, { name, map }], index) => {
      let sum = 0
      const series = days.map(d => {
        sum += (map[d] || 0)
        return sum
      })
      return {
        label: name,
        data: series,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        fill: false,
        tension: 0.1
      }
    })
  } catch (error) {
    console.error('Failed to load stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-8">
          <NuxtLink 
            to="/" 
            class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mb-4"
          >
            ← Back to Feed
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">📊 Challenge Statistics</h1>
          <p class="text-gray-600">Track your progress over time</p>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="text-4xl mb-4">📊</div>
          <div class="text-gray-600">Loading your statistics...</div>
        </div>

        <div v-else-if="datasets.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div class="text-6xl mb-4">📊</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No data to display</h3>
          <p class="text-gray-500 mb-6">Start adding entries to see your progress charts.</p>
          <NuxtLink 
            to="/entry/new"
            class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold inline-flex items-center gap-2"
          >
            <span>🍔</span>
            Add Your First Entry
          </NuxtLink>
        </div>

        <div v-else class="space-y-8">
          <CumulativeChart :labels="labels" :datasets="datasets" />
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Challenge Window</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Start Date:</span>
                  <span class="font-medium">September 1, 2025</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">End Date:</span>
                  <span class="font-medium">August 31, 2026</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Days:</span>
                  <span class="font-medium">365 days</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Days Remaining:</span>
                  <span class="font-medium text-orange-600">
                    {{ Math.max(0, Math.ceil((new Date('2026-08-31').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Active Players:</span>
                  <span class="font-medium">{{ datasets.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Top Score:</span>
                  <span class="font-medium text-orange-600">
                    {{ datasets.length > 0 ? Math.max(...datasets.map(d => Math.max(...d.data))) : 0 }} 🍔
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Leader:</span>
                  <span class="font-medium">
                    {{ datasets.length > 0 ? datasets.reduce((leader, current) => 
                        Math.max(...current.data) > Math.max(...leader.data) ? current : leader
                      ).label : 'N/A' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>