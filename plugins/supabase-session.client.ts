export default defineNuxtPlugin({
  name: 'supabase-session-persistence',
  async setup() {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    // Enhanced session recovery for mobile
    if (process.client) {
      // Check for existing session on app initialization
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('Session recovered successfully')
      } else {
        // Try to refresh the session if we have a refresh token
        const refreshToken = localStorage.getItem('burger-bonanza-auth.refresh-token')
        if (refreshToken) {
          try {
            await supabase.auth.refreshSession()
            console.log('Session refreshed successfully')
          } catch (error) {
            console.warn('Failed to refresh session:', error)
          }
        }
      }

      // Listen for auth state changes and persist them
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        // Force session persistence on mobile
        if (session) {
          localStorage.setItem('burger-bonanza-auth.access-token', session.access_token)
          localStorage.setItem('burger-bonanza-auth.refresh-token', session.refresh_token)
          localStorage.setItem('burger-bonanza-auth.expires-at', session.expires_at?.toString() || '')
        } else {
          // Clear stored tokens on logout
          localStorage.removeItem('burger-bonanza-auth.access-token')
          localStorage.removeItem('burger-bonanza-auth.refresh-token')
          localStorage.removeItem('burger-bonanza-auth.expires-at')
        }
      })

      // Periodic session validation (every 30 seconds)
      const validateSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session && user.value) {
          console.warn('Session lost, attempting recovery...')
          try {
            await supabase.auth.refreshSession()
          } catch (error) {
            console.error('Session recovery failed:', error)
          }
        }
      }

      // Run validation periodically
      setInterval(validateSession, 30000)

      // Validate session on page focus (when user returns to tab)
      window.addEventListener('focus', validateSession)
      
      // Validate session on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          validateSession()
        }
      })
    }
  }
})