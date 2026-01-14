import reciviData from 'virtual:recivi/data'

import type { Epic, Org, Role } from '@recivi/schema'

/**
 * Get the org linked to the given epic.
 *
 * @param epic the epic to find the linked org for
 * @returns the org where at least one role links to the epic
 */
export function getLinkedOrg(epic: Epic): Org | undefined {
  return reciviData.work.find((org) =>
    org.roles.some((role) => epic.id && role.epicIds.includes(epic.id)),
  )
}

/**
 * Get all the epics linked to the given role.
 *
 * @param role the role to find linked epics for
 * @returns all epics linked to the role
 */
export function getLinkedEpics(role: Role): Epic[] {
  return reciviData.creations.filter(
    (epic) => epic.id && role.epicIds.includes(epic.id),
  )
}
