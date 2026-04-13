export const mergeUniquePaths = (prev: string[], next: string[]): string[] => {
  const seen = new Set(prev)
  const out = [...prev]
  for (const p of next) {
    if (!seen.has(p)) {
      seen.add(p)
      out.push(p)
    }
  }
  return out
}
