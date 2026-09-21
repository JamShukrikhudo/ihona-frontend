export interface PropertyComment {
  id: number
  author: string | null
  body: string
  rating: number | null
  status: string
  created_at: string
}

/**
 * GET /v1/public/properties/:id/comments — anonymous, real. Only ever
 * returns comments an agent has already approved (see ihona-next's
 * PropertyCommentController) — a submitted comment never appears here
 * until moderated, by design.
 */
export async function useComments(propertyId: number) {
  const { data } = await useAsyncData(`property-comments-${propertyId}`, async () => {
    try {
      const res = await apiFetch<{ data: PropertyComment[] }>(`/v1/public/properties/${propertyId}/comments`)
      return res.data
    } catch {
      return []
    }
  })

  return data
}

/**
 * POST /v1/real-estate/properties/:id/comments — authenticated. The
 * returned comment is always status "pending" — the caller should tell
 * the visitor their review is awaiting moderation, not show it as live yet.
 */
export async function submitComment(propertyId: number, body: string, rating?: number) {
  return apiFetch<{ data: PropertyComment }>(`/v1/real-estate/properties/${propertyId}/comments`, {
    method: 'POST',
    body: { body, rating },
  })
}
