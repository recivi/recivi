import nav from "virtual:pf/nav";
import reciviData from "virtual:recivi/data";

import { defineTable } from "../types/table";
import { getLinkedEpics, getLinkedOrg } from "./relations";

/**
 * Get the table for the "Education" section.
 *
 * @returns the table for the "Education" section
 */
export function getCertsTable() {
	return defineTable(
		{
			institute: { title: "Institute", renderer: "Entity" },
			degree: { title: "Degree", renderer: "Text" },
			issue: { title: "Issued", renderer: "PfDate", class: "align-end" },
		},
		reciviData.education.flatMap((institute) =>
			institute.certs.map((cert) => {
				let degree = cert.shortName ?? cert.name;
				if (cert.field) {
					degree = `${degree} (${cert.field})`;
				}
				return {
					groupId: institute.id ?? institute.name,
					data: {
						institute: {
							entity: institute,
							useInternalLink: nav.resume.institute.pattern !== undefined,
						},
						degree,
						issue: { date: cert.issue },
					},
				};
			}),
		),
		"degree",
	);
}

/**
 * Get the table for the "Work" section.
 *
 * @returns the table for the "Work" section
 */
export function getRolesTable() {
	return defineTable(
		{
			org: { title: "Org", renderer: "Entity" },
			role: { title: "Role", renderer: "Text" },
			epic: { title: "Epic", renderer: "Entity" },
			period: { title: "Period", renderer: "Period" },
		},
		reciviData.work.flatMap((org) =>
			org.roles.map((role) => {
				const epic = getLinkedEpics(role)[0];
				return {
					groupId: org.id ?? org.name,
					data: {
						org: { entity: org, useInternalLink: nav.resume.org.pattern !== undefined },
						role: role.name,
						epic: epic ? { entity: epic } : undefined,
						period: role.period ? { period: role.period } : undefined,
					},
				};
			}),
		),
		"role",
	);
}

/**
 * Get the table for the "Creations" section.
 *
 * @returns the table for the "Creations" section
 */
export function getProjectsTable() {
	return defineTable(
		{
			epic: { title: "Epic", renderer: "Entity" },
			project: { title: "Project", renderer: "Text" },
			link: { title: "Link", renderer: "Anchor" },
			org: { title: "Org", renderer: "Entity" },
			tech: { title: "Tech", renderer: "TechStack" },
		},
		reciviData.creations.flatMap((epic) =>
			epic.projects.map((project) => {
				const org = epic.id ? getLinkedOrg(epic) : undefined;
				return {
					groupId: epic.id ?? epic.name,
					data: {
						epic: { entity: epic, useInternalLink: nav.resume.epic.pattern !== undefined },
						project: project.name,
						link: project.url ? { url: project.url } : undefined,
						org: org ? { entity: org, useShortName: true } : undefined,
						tech: { technologies: project.technologies },
					},
				};
			}),
		),
		"tech",
	);
}
