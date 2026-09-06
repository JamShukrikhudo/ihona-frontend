// avito.ru-style property URLs: /properties/{human-readable-slug}-{id}.
// The id is the only thing ever used to look up the property — the slug
// text is decorative. That means an edited title never breaks an old link
// (it just stops matching the *current* canonical slug, which the page
// corrects via a canonical tag rather than a redirect), and a bare
// /properties/{id} link from before this feature existed still resolves.
//
// Built from property.title alone (not translated labels) so the slug is
// locale-invariant — titles are entered once in Russian regardless of the
// site's active UI language, and the slug must stay the same no matter
// which locale a visitor is browsing in.
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
  // Tajik Cyrillic letters beyond the Russian alphabet, in case a title
  // ever uses them.
  ғ: 'g', қ: 'q', ӯ: 'u', ҳ: 'h', ҷ: 'j', і: 'i',
}

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
}

export function slugify(text: string): string {
  return transliterate(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

export function propertySlug(property: { id: number; title: string }): string {
  const base = slugify(property.title)
  return base ? `${base}-${property.id}` : String(property.id)
}

/** Pulls the id back out of a /properties/{slug} route param — the slug
 * text before it is never trusted, only the trailing number. */
export function extractPropertyId(param: string): number | null {
  const match = param.match(/(\d+)$/)
  if (!match) return null
  const id = Number(match[1])
  return Number.isInteger(id) && id > 0 ? id : null
}
