import { z } from 'astro/zod'

import { primaryRegistry } from '../registries/primary'

export const resumePdfSchema = z
  .object({
    /** whether to enable creation of résumé PDF during site build */
    isEnabled: z.boolean().optional().default(true).register(primaryRegistry, {
      description: 'whether to enable creation of résumé PDF during site build',
    }),
    /** the file name for the generated résumé PDF */
    fileName: z
      .string()
      .optional()
      .default('resume.pdf')
      .register(primaryRegistry, {
        description: 'the file name for the generated résumé PDF',
      }),
    /** the page size for the generated résumé PDF */
    pageSize: z
      .enum(['A4', 'Letter'])
      .optional()
      .default('A4')
      .register(primaryRegistry, {
        description: 'the page size for the generated résumé PDF',
      }),
  })
  .register(primaryRegistry, {
    id: 'resumePdf',
    description: 'the PDF generation settings for the résumé',
  })
  .transform((val) => {
    const pageDimensions =
      val.pageSize === 'A4'
        ? { inlineSize: '210mm', blockSize: '297mm' }
        : { inlineSize: '8.5in', blockSize: '11in' }
    return {
      ...val,
      pageDimensions,
    }
  })
