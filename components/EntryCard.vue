<script setup lang="ts">
const props = defineProps<{
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

const { entry } = toRefs(props)

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

function getStarDisplay(stars: number) {
  return '⭐'.repeat(stars)
}

function handleImageError(event: Event) {
  console.error('Image failed to load:', (event.target as HTMLImageElement).src)
}

function handleImageLoad(event: Event) {
  console.log('Image loaded successfully:', (event.target as HTMLImageElement).src)
}

const showImageModal = ref(false)

function openImageModal() {
  console.log('Opening image modal for:', entry.value.photo_url)
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-6 space-y-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold">
        {{ entry.users?.display_name?.charAt(0) || '?' }}
      </div>
      <div class="flex-1">
        <div class="font-semibold text-gray-900">{{ entry.users?.display_name || "Unknown User" }}</div>
        <div class="text-sm text-gray-500">{{ formatDate(entry.entry_date) }}</div>
      </div>
    </div>
    
    <div class="flex items-center gap-4 text-sm">
      <div class="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
        <span>🍔</span>
        <span class="font-semibold text-orange-700">{{ entry.amount }}</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-yellow-500">{{ getStarDisplay(entry.stars) }}</span>
        <span class="text-gray-600">({{ entry.stars }}/5)</span>
      </div>
    </div>
    
    <div v-if="entry.note" class="text-gray-700 text-sm italic bg-gray-50 p-3 rounded-lg">
      "{{ entry.note }}"
    </div>
    
    
    <div v-if="entry.photo_url" class="rounded-lg overflow-hidden bg-gray-100 max-w-md mx-auto">
      <div 
        class="relative aspect-[4/3] w-full max-h-64 cursor-pointer" 
        @click="openImageModal"
        @mouseenter="() => console.log('Mouse entered container')"
      >
        <img 
          :src="entry.photo_url" 
          :alt="`Burger photo by ${entry.users?.display_name}`"
          class="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
          @error="handleImageError"
          @load="handleImageLoad"
          @click="openImageModal"
          @mouseenter="() => console.log('Mouse entered image')"
        />
        <!-- Image overlay on hover for better interactivity -->
        <div 
          class="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
          @click="openImageModal"
          @mouseenter="() => console.log('Mouse entered overlay')"
        >
          <div class="bg-white/90 rounded-full p-2 backdrop-blur-sm pointer-events-none">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Modal - Outside the card for proper z-index -->
  <Teleport to="body">
    <div 
      v-if="showImageModal && entry.photo_url" 
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      @click="closeImageModal"
    >
      <div class="relative max-w-4xl max-h-[calc(100vh-2rem)] mx-auto" @click.stop>
        <img 
          :src="entry.photo_url" 
          :alt="`Full size burger photo by ${entry.users?.display_name}`"
          class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
        <button 
          @click="closeImageModal"
          class="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <!-- Image info overlay -->
        <div class="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
          <div class="text-sm font-medium">{{ entry.users?.display_name }}</div>
          <div class="text-xs opacity-75">{{ formatDate(entry.entry_date) }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>