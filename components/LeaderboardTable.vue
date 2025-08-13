<script setup lang="ts">
defineProps<{ 
  rows: Array<{ 
    user_id: string
    display_name: string
    total: number
    first_entry?: string
    last_entry?: string
  }> 
}>()

function getRankEmoji(index: number) {
  switch (index) {
    case 0: return '🥇'
    case 1: return '🥈'
    case 2: return '🥉'
    default: return `#${index + 1}`
  }
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        🏆 Leaderboard
      </h3>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left p-4 font-medium text-gray-700">Rank</th>
            <th class="text-left p-4 font-medium text-gray-700">Player</th>
            <th class="text-right p-4 font-medium text-gray-700">Total 🍔</th>
            <th class="text-center p-4 font-medium text-gray-700">Period</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, index) in rows" 
            :key="row.user_id" 
            class="border-t border-gray-100 hover:bg-gray-50 transition"
            :class="{ 'bg-yellow-50': index < 3 }"
          >
            <td class="p-4">
              <span class="text-lg font-semibold" :class="{ 'text-yellow-600': index < 3 }">
                {{ getRankEmoji(index) }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
                  {{ row.display_name.charAt(0) }}
                </div>
                <span class="font-medium text-gray-900">{{ row.display_name }}</span>
              </div>
            </td>
            <td class="p-4 text-right">
              <span class="text-xl font-bold text-orange-600">{{ row.total }}</span>
            </td>
            <td class="p-4 text-center text-sm text-gray-500">
              <div v-if="row.first_entry && row.last_entry && row.first_entry !== row.last_entry">
                {{ formatDate(row.first_entry) }} - {{ formatDate(row.last_entry) }}
              </div>
              <div v-else-if="row.first_entry">
                {{ formatDate(row.first_entry) }}
              </div>
              <div v-else>
                No entries
              </div>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="4" class="p-8 text-center text-gray-500">
              <div class="flex flex-col items-center gap-2">
                <span class="text-4xl">🍔</span>
                <span>No entries yet! Be the first to start the challenge.</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>