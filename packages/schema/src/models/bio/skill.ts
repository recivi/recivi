import { z } from 'zod'

export interface FormalSkill {
  name: string
  id?: string
  subSkills?: Skill[]
}

const baseFormalSkillSchema = z.object({
  name: z.string().describe('the name of the skill'),
  id: z
    .optional(z.string())
    .describe(
      'an identifier for the skill; In implementations, this can be used as a key to find the logo for the skill.'
    ),
})

const formalSkillSchema: z.ZodType<FormalSkill> = baseFormalSkillSchema.extend({
  subSkills: z
    .optional(z.lazy(() => z.array(skillSchema)))
    .describe('a list of skills that are considered as sub-parts of this one'),
})

export const skillSchema = z
  .union([
    z
      .string()
      .describe(
        'the name of the skill; This form should be used when an ID and sub-skills are not provided.'
      ),
    formalSkillSchema.describe(
      'a combination of the skill name, an ID and sub-skills; This form should be used when an ID or sub-skills are provided.'
    ),
  ])
  .describe('a skill and optional sub-skills possessed by a person')

/**
 * Examples:
 *
 * ```json
 * {
 *   "name": "JavaScript",
 *   "subSkills": [
 *     "Vue.js",
 *     {
 *       "name": "React",
 *       "subSkills": [
 *         "Next.js"
 *       ]
 *     }
 *   ]
 * }
 * ```
 *
 * ---
 *
 * ```json
 * "Woodworking"
 * ```
 */
export type Skill = z.infer<typeof skillSchema>
