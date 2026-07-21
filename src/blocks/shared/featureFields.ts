import type { Field } from 'payload'

/**
 * Shared field core for the Feature component family.
 *
 * Every feature variant (feature-grid-basic, feature-split, feature-bento,
 * feature-steps, …) spreads these section-heading fields first and then
 * appends its own variant-specific shape — the item array and CTA links,
 * which differ per layout. Editing the shared eyebrow/title/description here
 * updates every installed feature block at once, so the family never drifts
 * field-by-field across a repo.
 *
 * Installed once per repo at `src/blocks/shared/featureFields.ts`; re-running
 * `payload-components add feature-*` never overwrites a copy you have already edited.
 */
export const featureFields: Field[] = [
  {
    name: 'eyebrow',
    type: 'text',
  },
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
]
