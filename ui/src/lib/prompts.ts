import { AGENT_REGISTRY } from './agent-names';

// ─── BUILD PROMPTS ─────────────────────────────────────────────────────────────

export const SYSTEM_PROMPTS = {

  // 5 analysts from one sector discuss the policy
  SECTOR_TEAM: (
    sectorName: string,
    sectorFocus: string,
    analystIds: string[],
    analystTraits: Record<string, Record<string, number>>,
    policy: { title: string; summary: string }
  ): string => {
    const names = analystIds.map(id => AGENT_REGISTRY[id]?.name ?? id);
    const traitLines = analystIds
      .map(id => {
        const traits = analystTraits[id] ?? {};
        const top = Object.entries(traits)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 2)
          .map(([k, v]) => `${k.replace(/_/g, ' ')} ${Math.round(v * 100)}%`)
          .join(', ');
        return `- ${AGENT_REGISTRY[id]?.name ?? id}: ${top}`;
      })
      .join('\n');

    return `You are simulating a 60-second team meeting for Metroville's ${sectorName} department.

POLICY: "${policy.title}"
FOCUS for your sector: ${sectorFocus}

TEAM MEMBERS:
${traitLines}

INSTRUCTIONS:
1. Write a short conversation (6-8 lines) where each analyst speaks at least once.
2. Format every line as: [FirstName]: [what they say]
3. Show genuine disagreement or debate shaped by each person's traits.
4. After the conversation, on NEW lines, write EXACTLY:

TEAM VOTE: X/5
RECOMMENDATION: [one clear sentence on whether to support the policy and why]
SUMMARY: [one sentence on the team's main concern]`;
  },

  // 3 heads review team results and debate
  SECTOR_HEADS: (
    teamRecommendations: { name: string; recommendation: string }[],
    policy: { title: string }
  ): string => {
    const recLines = teamRecommendations
      .map(r => `- ${r.name}: "${r.recommendation}"`)
      .join('\n');

    return `You are simulating a 5-minute executive meeting between three department heads of Metroville.
The heads are: Director Marcus Hale (Infrastructure), Director Priya Nair (Economic Dev.), Director Cole Reeves (Public Safety).

POLICY UNDER REVIEW: "${policy.title}"

TEAM RECOMMENDATIONS THEY RECEIVED:
${recLines}

INSTRUCTIONS:
1. Write a conversation (6-10 lines) where each head speaks at least twice.
2. Format every line as: [FirstName]: [what they say]
3. Each head must reference their team's recommendation.
4. They should debate and reach a consensus or majority.
5. After the conversation, on NEW lines, write EXACTLY:

HEADS VOTE: X/3
FINAL RECOMMENDATION: [one clear sentence to give the Mayor]
SUMMARY: [one sentence on what the heads agreed to prioritize]`;
  },

  // President reviews everything and makes the final call
  PRESIDENT: (
    teamRecommendations: { sector: string; recommendation: string }[],
    headsRecommendation: string,
    policy: { title: string }
  ): string => {
    const recLines = teamRecommendations
      .map(r => `- ${r.sector}: "${r.recommendation}"`)
      .join('\n');

    return `You are Mayor Elara Voss of Metroville, making the final decision on a policy.

POLICY: "${policy.title}"

DEPARTMENT TEAM RECOMMENDATIONS:
${recLines}

SECTOR HEADS CONSENSUS: "${headsRecommendation}"

INSTRUCTIONS:
Write your reasoning in first person as Mayor Elara Voss (5-8 sentences).
Think through each recommendation, the trade-offs, and what Metroville needs most.
Then on NEW lines, write EXACTLY:

VERDICT: [APPROVED / REJECTED / MODIFIED] - [one sentence justification]
STATS: TRAFFIC: [+/-]% | APPROVAL: [+/-]% | BUDGET: [+/-]$M | HOUSING: [+/-]%
IMPACT ANALYSIS: [one sentence summary]

CRITICAL: You MUST include the STATS: line exactly as shown above, but with your calculated numbers. Do not omit it.`;
  },
};

// ─── PARSE RESPONSE ────────────────────────────────────────────────────────────

export interface ParsedBoxResult {
  transcript: { agent_id: string; name: string; role: string; content: string }[];
  voteFor: number;
  voteTotal: number;
  recommendation: string;
  summary: string;
  stats?: {
    traffic: string;
    approval: string;
    budget: string;
    housing: string;
  };
}

export function parseOllamaResponse(text: string, isPresident = false): ParsedBoxResult {
  // -- Extract structured markers --
  const teamVote   = text.match(/TEAM VOTE:\s*(\d+)\/(\d+)/i);
  const headsVote  = text.match(/HEADS VOTE:\s*(\d+)\/(\d+)/i);
  const voteMatch  = teamVote ?? headsVote;
  const voteFor    = voteMatch ? parseInt(voteMatch[1], 10) : (isPresident ? 0 : 0);
  const voteTotal  = voteMatch ? parseInt(voteMatch[2], 10) : (isPresident ? 0 : 5);

  const verdictMatch = text.match(/VERDICT:\s*(.+)/i);
  const finalRecMatch = text.match(/FINAL RECOMMENDATION:\s*(.+)/i);
  const recMatch = text.match(/RECOMMENDATION:\s*(.+)/i);
  const summaryMatch = text.match(/(?:SUMMARY|IMPACT ANALYSIS):\s*(.+)/i);

  const recommendation = (
    (isPresident ? verdictMatch?.[1] : finalRecMatch?.[1] ?? recMatch?.[1]) ?? 'Pending...'
  ).trim();

  const summary = (summaryMatch?.[1] ?? 'Analysis complete.').trim();

  // -- Extract Projected Stats (Flexible Parsing) --
  let stats;
  if (isPresident) {
    const extract = (key: string) => {
      const reg = new RegExp(`${key}:?\\s*([+-]?\\s*\\d+[^|\\n]*)`, 'i');
      const m = text.match(reg);
      return m ? m[1].trim() : null;
    };

    const traffic = extract('TRAFFIC');
    const approval = extract('APPROVAL');
    const budget = extract('BUDGET');
    const housing = extract('HOUSING');

    if (traffic || approval || budget || housing) {
      stats = {
        traffic: traffic ?? '+0%',
        approval: approval ?? '+0%',
        budget: budget ?? '+$0M',
        housing: housing ?? '+0%',
      };
    } else {
      // Final fallback to zero if absolutely nothing found
      stats = { traffic: '+0%', approval: '+0%', budget: '+$0M', housing: '+0%' };
    }
  }

  // -- Extract dialogue (everything before first structural marker) --
  const markerIdx = text.search(/\n(?:TEAM VOTE|HEADS VOTE|RECOMMENDATION|FINAL RECOMMENDATION|VERDICT|STATS|SUMMARY|IMPACT ANALYSIS):/i);
  const transcriptRaw = markerIdx > 0 ? text.slice(0, markerIdx) : text;

  const lines = transcriptRaw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 3 && l.includes(':'))
    .map(l => {
      const colonIdx = l.indexOf(':');
      const rawName = l.slice(0, colonIdx).replace(/[\[\]\*"'()\-–]/g, '').trim();
      const content = l.slice(colonIdx + 1).trim();

      if (!content || content.length < 3) return null;

      // Match known agent by first name
      const entry = Object.entries(AGENT_REGISTRY).find(([, info]) =>
        rawName.toLowerCase().startsWith(info.name.split(' ')[0].toLowerCase())
      );

      const agentId = entry?.[0] ?? rawName.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 12);
      const identity = entry?.[1];

      return {
        agent_id: agentId,
        name: identity?.name ?? rawName,
        role: identity?.title ?? 'Agent',
        content,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null && m.content.length > 2);

  // Fallback: treat entire transcript as one monologue if no dialogue found
  if (lines.length === 0 && transcriptRaw.trim().length > 10) {
    return {
      transcript: [{
        agent_id: isPresident ? 'PRESIDENT' : 'SYSTEM',
        name: isPresident ? 'Mayor Elara Voss' : 'System Log',
        role: isPresident ? 'Mayor of Metroville' : 'Analysis',
        content: transcriptRaw.trim(),
      }],
      voteFor, voteTotal, recommendation, summary, stats,
    };
  }

  return { transcript: lines, voteFor, voteTotal, recommendation, summary, stats };
}
