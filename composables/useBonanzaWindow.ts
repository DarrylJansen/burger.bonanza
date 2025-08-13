export function useBonanzaWindow() {
  const config = useRuntimeConfig().public
  const start = new Date(config.bonanzaStart)
  const end = new Date(config.bonanzaEnd)
  
  function isWithin(date: Date) {
    return date >= start && date <= end
  }
  
  return { start, end, isWithin }
}