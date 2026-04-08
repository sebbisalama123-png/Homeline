import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'hearth-timber',
  title: 'Hearth & Timber Uganda',

  // Replace with your actual Project ID from sanity.io/manage
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',

  plugins: [
    structureTool(),
    visionTool(), // lets you run GROQ queries directly in the Studio
  ],

  schema: {
    types: schemaTypes,
  },
})
