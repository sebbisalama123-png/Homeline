import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './client'

const builder = imageUrlBuilder(sanityClient)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanityImageUrl(source: any) {
  return builder.image(source)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function productImageUrl(source: any, width = 1200): string {
  return sanityImageUrl(source).width(width).auto('format').quality(80).url()
}
