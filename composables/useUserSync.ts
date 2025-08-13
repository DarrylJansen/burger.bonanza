export function useUserSync() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  async function syncUser(retries = 3) {
    // Try to recover session if user is not available
    if (!user.value) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('User not authenticated')
        }
        // Wait for user ref to update
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        throw new Error('User not authenticated')
      }
    }
    
    if (!user.value) {
      throw new Error('User not authenticated')
    }
    
    try {
      // Check if user exists in our users table
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.value.id)
        .maybeSingle()

      if (!existing) {
        // Create user record
        const { error } = await supabase.from("users").insert({
          id: user.value.id,
          display_name: user.value.user_metadata?.full_name || user.value.email?.split("@")[0] || "Anonymous User",
          avatar_url: user.value.user_metadata?.avatar_url || null
        })
        
        if (error) {
          throw error
        }
      }
    } catch (error) {
      // Retry on network/temporary errors
      if (retries > 0 && (error as any)?.message?.includes('network')) {
        console.warn(`User sync failed, retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return syncUser(retries - 1)
      }
      throw error
    }
  }
  
  return { syncUser }
}