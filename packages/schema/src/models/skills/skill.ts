import { z } from "zod";

import { type Tag, tagSchema } from "@/models/base/tag";
import { primaryRegistry } from "@/registries/primary";

export const formalSkillSchema = z.object({
	id: z.optional(z.string()).register(primaryRegistry, {
		description:
			"an identifier for the skill; In implementations, this can be used as a key to find the logo for the skill.",
	}),
	name: z.string().register(primaryRegistry, {
		description: "the name of the skill",
	}),
	tags: z.array(tagSchema).optional().default([]).register(primaryRegistry, {
		description:
			"tags to apply to this skill; The use of tags is left up to the application (for example, the portfolio uses tags for PDF résumés).",
	}),
	get subSkills(): z.ZodDefault<z.ZodOptional<z.ZodArray<typeof skillSchema>>> {
		return z.array(skillSchema).optional().default([]).register(primaryRegistry, {
			description: "a list of skills that are considered as sub-parts of this one",
		});
	},
});

export type FormalSkill = Omit<z.infer<typeof formalSkillSchema>, "tags"> & {
	tags: Tag[];
};
type _FormalSkill = z.input<typeof formalSkillSchema>;

primaryRegistry.add(formalSkillSchema, {
	description:
		"a combination of the skill name, an ID and sub-skills; This form should be used when an ID or sub-skills are provided.",
	examples: [
		{
			id: "javascript",
			name: "JavaScript",
			tags: ["language"],
			subSkills: [
				{
					id: "vuedotjs",
					name: "Vue.js",
					tags: ["framework"],
					subSkills: ["Nuxt.js" satisfies _Skill],
				} satisfies _FormalSkill,
				{
					id: "react",
					name: "React",
					tags: ["framework"],
				} satisfies _FormalSkill,
			],
		} satisfies _FormalSkill,
	],
});

export const skillSchema = z.union([
	z.string().register(primaryRegistry, {
		description:
			"the name of the skill; This form should be used when an ID and sub-skills are not provided.",
		examples: ["Woodworking"],
	}),
	formalSkillSchema,
]);

// `Omit` does not distribute over a union, so the `tags` override has to be
// applied to the formal branch rather than to the union as a whole.
export type Skill = string | FormalSkill;
type _Skill = z.input<typeof skillSchema>;

primaryRegistry.add(skillSchema, {
	id: "Skill",
	description: "a skill and optional sub-skills possessed by a person",
	examples: [
		"Plumbing" satisfies _Skill,
		{
			id: "python",
			name: "Python",
			subSkills: [
				{
					id: "django",
					name: "Django",
					subSkills: ["Django REST Framework" satisfies _Skill],
				} satisfies _Skill,
				{
					id: "flask",
					name: "Flask",
				} satisfies _Skill,
			],
		} satisfies _Skill,
	],
});
