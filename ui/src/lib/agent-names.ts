// Static registry mapping agent IDs to human-readable names and titles

export interface AgentIdentity {
  name: string;
  title: string;
  initial: string; // For avatar
}

export const AGENT_REGISTRY: Record<string, AgentIdentity> = {
  // ─── President ───
  PRESIDENT:   { name: 'Mayor Elara Voss',     title: 'Mayor of Metroville',           initial: 'EV' },

  // ─── Infrastructure ───
  DM_INF1:     { name: 'Director Marcus Hale', title: 'Head of Infrastructure',         initial: 'MH' },
  E_INF1_01:   { name: 'Anna Brennan',         title: 'Transit Systems Analyst',        initial: 'AB' },
  E_INF1_02:   { name: 'Luis Ortiz',           title: 'Urban Planning Analyst',         initial: 'LO' },
  E_INF1_03:   { name: 'Fatima Aziz',          title: 'Road Capacity Analyst',          initial: 'FA' },
  E_INF1_04:   { name: 'Tom Fields',           title: 'Utilities & Grid Analyst',       initial: 'TF' },
  E_INF1_05:   { name: 'Yuki Tanaka',          title: 'Environmental Buffers Analyst',  initial: 'YT' },

  // ─── Economic Development ───
  DM_ECO2:     { name: 'Director Priya Nair',  title: 'Head of Economic Development',  initial: 'PN' },
  E_ECO2_01:   { name: 'Sam Park',             title: 'Business Growth Analyst',        initial: 'SP' },
  E_ECO2_02:   { name: 'Dara Osei',            title: 'Tax Revenue Analyst',            initial: 'DO' },
  E_ECO2_03:   { name: 'Ingrid Holm',          title: 'Budget & Surplus Analyst',       initial: 'IH' },
  E_ECO2_04:   { name: 'Wei Zhang',            title: 'Investment Climate Analyst',     initial: 'WZ' },
  E_ECO2_05:   { name: 'Rosa Mendez',          title: 'Labor Market Analyst',           initial: 'RM' },

  // ─── Public Safety ───
  DM_PUB3:     { name: 'Director Cole Reeves', title: 'Head of Public Safety',          initial: 'CR' },
  E_PUB3_01:   { name: 'Kai Jensen',           title: 'Emergency Services Analyst',     initial: 'KJ' },
  E_PUB3_02:   { name: 'Meera Patel',          title: 'Pollution & Health Analyst',     initial: 'MP' },
  E_PUB3_03:   { name: 'Derek Walsh',          title: 'Crime & Safety Analyst',         initial: 'DW' },
  E_PUB3_04:   { name: 'Lily Chen',            title: 'Community Welfare Analyst',      initial: 'LC' },
  E_PUB3_05:   { name: 'Omar Farouk',          title: 'Disaster Resilience Analyst',    initial: 'OF' },
};

export function getAgentName(id: string): string {
  return AGENT_REGISTRY[id]?.name ?? id;
}

export function getAgentTitle(id: string): string {
  return AGENT_REGISTRY[id]?.title ?? 'Agent';
}

export function getAgentInitial(id: string): string {
  return AGENT_REGISTRY[id]?.initial ?? id.slice(0, 2).toUpperCase();
}
