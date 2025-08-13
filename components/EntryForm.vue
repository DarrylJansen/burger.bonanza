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
  
  try {
    // Ensure user exists in database
    const { syncUser } = useUserSync()
    await syncUser()
    
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

    if (insErr) {
      error.value = insErr.message
      submitting.value = false
      return
    }
    
    navigateTo("/")
  } catch (err) {
    error.value = err instanceof Error ? err.message : "An error occurred"
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-6 bg-white rounded-lg shadow-lg p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input 
          v-model="form.entry_date" 
          type="date" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Amount 🍔</label>
        <input 
          v-model.number="form.amount" 
          type="number" 
          min="1" 
          max="50" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Rating ⭐</label>
        <select 
          v-model.number="form.stars" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="1">⭐ (1 star)</option>
          <option value="2">⭐⭐ (2 stars)</option>
          <option value="3">⭐⭐⭐ (3 stars)</option>
          <option value="4">⭐⭐⭐⭐ (4 stars)</option>
          <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
        <input 
          type="file" 
          accept="image/*" 
          @change="e => form.file = (e.target as HTMLInputElement).files?.[0] || null"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
      <textarea 
        v-model="form.note" 
        rows="3" 
        maxlength="500" 
        placeholder="How was your burger experience?"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      />
      <div class="text-xs text-gray-500 mt-1">{{ form.note.length }}/500 characters</div>
    </div>
    
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-600 text-sm">{{ error }}</p>
    </div>
    
    <button 
      type="submit"
      :disabled="submitting"
      class="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition flex items-center justify-center gap-2"
    >
      <span v-if="submitting">Saving...</span>
      <span v-else>🍔 Save Entry</span>
    </button>
  </form>
</template>