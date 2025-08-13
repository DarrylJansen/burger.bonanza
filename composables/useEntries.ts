export function useEntries() {
  const supabase = useSupabaseClient()
  
  async function fetchRecent(limit = 30) {
    const { data, error } = await supabase
      .from("entries")
      .select("id, entry_date, amount, stars, note, photo_url, user_id, users(display_name, avatar_url)")
      .order("entry_date", { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  }
  
  return { fetchRecent }
}