export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  
  // Skip auth check for login page
  if (to.path === "/login") {
    return
  }
  
  // If no user, try to recover session first
  if (!user.value && process.client) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('Session recovered in middleware')
        // Wait a moment for the user ref to update
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.warn('Session recovery failed in middleware:', error)
    }
  }
  
  // After attempting recovery, check if we still need to redirect
  if (!user.value) {
    return navigateTo("/login")
  }
})