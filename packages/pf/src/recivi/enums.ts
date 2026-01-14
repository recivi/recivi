import type {
  LanguageProficiency,
  RoleLocation,
  RoleType,
} from '@recivi/schema'

const ROLE_TYPE_DISPLAYS = {
  contract: 'Contract',
  foss: 'FOSS',
  'full-time': 'Full-time',
  internship: 'Internship',
  'part-time': 'Part-time',
  freelance: 'Freelance',
  temp: 'Temporary',
  volunteer: 'Volunteer',
  other: 'Other',
} as const

/**
 * Get the display name for a given role type code.
 *
 * @param roleType the code for the type of the role
 * @returns the display name for the role type
 */
export function getRoleTypeDisplay(roleType: RoleType): string {
  return ROLE_TYPE_DISPLAYS[roleType]
}

const ROLE_LOCATION_DISPLAY = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
} as const

/**
 * Get the display name for a given role location code.
 *
 * @param roleLocation the code for the location of the role
 * @returns the display name for the role location
 */
export function getRoleLocationDisplay(roleLocation: RoleLocation): string {
  return ROLE_LOCATION_DISPLAY[roleLocation]
}

const LANGUAGE_PROFICIENCY_DISPLAY = {
  not_possible: 'N/A',
  no: 'No',
  elementary: 'Elementary',
  limited_working: 'Limited',
  professional_working: 'Professional',
  full_professional: 'Full',
  native: 'Native',
} as const

/**
 * Get the display name for a given language proficiency code.
 *
 * @param proficiency the code for the language proficiency
 * @returns the display name for the language proficiency
 */
export function getLanguageProficiencyDisplay(
  proficiency: LanguageProficiency,
): string {
  return LANGUAGE_PROFICIENCY_DISPLAY[proficiency]
}
