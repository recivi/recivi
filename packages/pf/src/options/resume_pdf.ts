import { z } from 'astro/zod'

export const resumePdfSchema = z
  .object({
    /** whether to enable creation of résumé PDF during site build */
    isEnabled: z.boolean().optional().default(true),
    /** the file name for the generated résumé PDF */
    fileName: z.string().optional().default('resume.pdf'),
    /** the page size for the generated résumé PDF */
    pageSize: z.enum(['A4', 'Letter']).optional().default('A4'),
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
