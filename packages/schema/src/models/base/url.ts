import { z } from 'zod'

export const urlSchema = z
  .union([
    z
      .string()
      .url()
      .describe(
        'the URL endpoint; This form should be used when a label is not provided.'
      ),
    z
      .object({
        dest: z.string().url().describe('the URL endpoint'),
        label: z
          .string()
          .describe(
            'a label for the URL; This makes the URL accessible and provides more info about the destination.'
          ),
      })
      .describe(
        'a combination of the URL endpoint and a label for a11y purposes; This form should be used when a label is provided.'
      ),
  ])
  .describe('a URL endpoint and an optional label for a11y purposes')

/**
 * Examples:
 *
 * ```json
 * {
 *   "dest": "https://dhruvkb.dev",
 *   "label": "My website"
 * }
 * ```
 *
 * ---
 *
 * ```json
 * "https://dhruvkb.dev"
 * ```
 */
export type Url = z.infer<typeof urlSchema>
