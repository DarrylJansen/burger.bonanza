export function useUserSync() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  async function syncUser() {
    if (!user.value) {
      throw new Error('User not authenticated')
    }
    
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
  }
  
  return { syncUser }
}