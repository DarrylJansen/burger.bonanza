<script setup lang="ts">
onMounted(async () => { 
  const { syncUser } = useUserSync()
  await syncUser()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <NuxtLink 
            to="/" 
            class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mb-4"
          >
            ← Back to Feed
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">🍔 New Burger Entry</h1>
          <p class="text-gray-600">How many burgers did you eat today?</p>
        </div>

        <EntryForm />
        
        <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-900 mb-2">💡 Tips for Great Entries</h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Be honest about your burger count</li>
            <li>• Rate based on taste, not just quantity</li>
            <li>• Add photos to make your entries more engaging</li>
            <li>• Share details about the restaurant or burger type in your notes</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>