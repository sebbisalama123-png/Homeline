import { createClient } from '@sanity/client'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined
const dataset = (import.meta.env.VITE_SANITY_DATASET as string | undefined) ?? 'production'

export function isSanityConfigured(): boolean {
  return Boolean(projectId)
}

export const sanityClient = createClient({
  projectId: projectId ?? 'unconfigured',
  dataset,
  apiVersion: '2025-04-02',
  useCdn: true,
  perspective: 'published',
})
