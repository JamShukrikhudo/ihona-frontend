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
 * public browse endpoints, requesting a viewing or a stay legitimately
 * requires a login: it's tied to the requesting user (created_by), and an
 * anonymous request would just be a spam vector. The same endpoint backs
 * two request shapes: a viewing appointment (just startsAt, an hour slot)
 * and a tourism-type nightly-stay booking (startsAt/endsAt as check-in/
 * check-out, plus guestsCount) — same request/host-confirms flow either
 * way, see the host's Viewing model.
 */
export async function requestViewing(
  propertyId: number,
  startsAt: string,
  subject: string,
  endsAt?: string,
  guestsCount?: number,
) {
  return apiFetch<ViewingResponse>('/v1/real-estate/viewings', {
    method: 'POST',
    body: {
      subject,
      property_id: propertyId,
      starts_at: startsAt,
      ends_at: endsAt,
      guests_count: guestsCount,
    },
  })
}
