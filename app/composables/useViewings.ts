interface ViewingResponse {
  data: {
    id: number
    subject: string
    status: string
    starts_at: string
  }
}

/**
 * POST /v1/real-estate/viewings — authenticated (auth:sanctum). Unlike the
 * public browse endpoints, booking a viewing legitimately requires a login:
 * it's tied to the requesting user (party_id/created_by), and anonymous
 * booking would just be a spam vector. The host validates
 * $user->current_team_id !== null — every seeded/manually-created user in
 * this composition has one; a future self-registration flow will need to
 * assign one on signup.
 */
export async function requestViewing(propertyId: number, startsAt: string, subject: string) {
  return apiFetch<ViewingResponse>('/v1/real-estate/viewings', {
    method: 'POST',
    body: {
      subject,
      property_id: propertyId,
      starts_at: startsAt,
    },
  })
}
