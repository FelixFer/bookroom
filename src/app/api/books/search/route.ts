import { ok, err } from '@/lib/server-utils'

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  if (!query) return err('Query parameter "q" is required', 400)

  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,cover_i,first_publish_year`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      return err('Failed to fetch from Open Library', 502)
    }

    const data = await response.json()
    return ok({ docs: data.docs ?? [] })
  } catch {
    return err('Could not reach Open Library. Check your connection.', 502)
  }
}
