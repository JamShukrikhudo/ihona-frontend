/**
 * "Опубликовано N дн. назад" style freshness line. Deliberately uses an
 * abbreviation ("дн.") for ru rather than "день/дня/дней" — sidesteps
 * Russian's 3-way plural agreement (vue-i18n's default pluralization
 * doesn't handle it) without mistranslating; tg/uz don't inflect nouns
 * for count the way ru does, so their day-word stays invariant regardless.
 */
export function formatPublishedAgo(iso: string | null, t: (key: string, params?: Record<string, unknown>) => string): string | null {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return null

  const days = Math.max(0, Math.floor((Date.now() - then) / 86_400_000))
  if (days === 0) return t('property.published_today')
  if (days === 1) return t('property.published_yesterday')
  return t('property.published_days_ago', { count: days })
}
