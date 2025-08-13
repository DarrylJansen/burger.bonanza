export function useLeaderboard() {
  const supabase = useSupabaseClient()
  
  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from("leaderboard_view")
      .select("*")
      .order("total", { ascending: false })
    if (error) throw error
    return data
  }
  
  return { fetchLeaderboard }
}