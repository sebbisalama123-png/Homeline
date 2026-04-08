import { defineField, defineType } from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Living Room', value: 'Living Room' },
          { title: 'Bedroom', value: 'Bedroom' },
          { title: 'Dining', value: 'Dining' },
          { title: 'Home Office', value: 'Home Office' },
          { title: 'Storage', value: 'Storage' },
          { title: 'Lighting', value: 'Lighting' },
          { title: 'Outdoor', value: 'Outdoor' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      description: 'One-line teaser shown on product cards',
      type: 'string',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'price',
      title: 'Price (UGX)',
      type: 'number',
      description: 'Base price in Uganda Shillings — no commas, whole numbers only',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale Price (UGX)',
      type: 'number',
      description: 'Leave empty if not on sale',
      validation: (Rule) =>
        Rule.positive().integer().custom((salePrice, context) => {
          const price = (context.document?.price as number) ?? 0
          if (salePrice !== undefined && salePrice >= price) {
            return 'Sale price must be lower than the base price'
          }
          return true
        }),
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      options: {
        list: [
          { title: 'In Stock', value: 'In Stock' },
          { title: 'Made to Order', value: 'Made to Order' },
        ],
        layout: 'radio',
      },
      initialValue: 'Made to Order',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      description: 'e.g. "Solid oak + stain-resistant fabric"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g. "200cm L x 95cm W x 75cm H"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'leadTime',
      title: 'Lead Time',
      type: 'string',
      description: 'e.g. "7-14 days delivery in Uganda"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Out of 5 — e.g. 4.8',
      initialValue: 4.5,
      validation: (Rule) => Rule.required().min(0).max(5).precision(1),
    }),
    defineField({
      name: 'reviews',
      title: 'Review Count',
      type: 'number',
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0).integer(),
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
})
