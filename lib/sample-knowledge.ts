import { getSupabaseServerClient } from "./supabase";

export type KbDocument = {
  title: string;
  docType: string;
  content: string;
};

/**
 * Local fallback knowledge base.
 *
 * Everything here is clearly-labelled SAMPLE / illustrative content used to
 * demonstrate retrieval-and-citation behaviour. None of this is real CWW
 * client data — swap it out for real, permissioned artefacts (via the
 * Supabase babypm_kb_documents table, see supabase/schema.sql) before using this
 * for anything beyond a concept demo.
 */
const SAMPLE_DOCS: KbDocument[] = [
  {
    title: "Sample Weekly Status Report Template",
    docType: "sample_report",
    content: `Project: Sample Council — Finance System Replacement (illustrative example)
Reporting period: Week ending [date]

Executive summary: Delivery is broadly on track. Data migration dry-run #2 completed with a 94% match rate against source records, against an 98% target before go-live.

Delivery confidence: AMBER — on track for the milestone date, but the migration match-rate gap and one outstanding vendor dependency need to close within two weeks to hold GREEN.

Milestones this period: UAT test pack signed off; migration dry-run #2 complete.
Upcoming milestones: Migration dry-run #3 (target 98% match); training material sign-off.

Risks: Match-rate shortfall could push go-live if not resolved by dry-run #3.
Issues: One integration vendor has not yet confirmed test environment availability.
Dependencies: Client finance team sign-off on reconciliation approach.
Recommended actions: Escalate vendor environment dependency to steering committee; schedule a focused data-quality working session before dry-run #3.`,
  },
  {
    title: "Sample Case Study — Local Government ERP Rollout",
    docType: "sample_case_study",
    content: `Client type: Local government authority (illustrative example, anonymised)
Engagement: Programme advisory and test management for an ERP replacement covering finance, payroll and procurement.

Approach: Established a governance cadence (steering committee, RAG-rated weekly reporting, risk and issue register), ran an independent test management function across SIT, UAT and cutover rehearsal, and produced executive-ready status reporting throughout.

Outcome: Programme delivered with two cutover rehearsals reducing go-live defects materially versus the authority's prior major system implementation. Reporting cadence was credited by the client's executive sponsor as the clearest visibility they had had into programme risk during the engagement.

Relevant services: Program and project advisory, test management, governance design, executive reporting.`,
  },
  {
    title: "Sample Case Study — Healthcare System Data Migration Readiness",
    docType: "sample_case_study",
    content: `Client type: Healthcare provider (illustrative example, anonymised)
Engagement: Data migration readiness assessment and cutover planning advisory ahead of a clinical systems consolidation.

Approach: Ran a readiness assessment against migration, testing and cutover-planning criteria, identified gaps in data quality ownership, and built a cutover runbook with rollback triggers and go/no-go criteria for executive sign-off.

Outcome: Go/no-go criteria were adopted as the standard cutover governance artefact for two subsequent phases of the programme.

Relevant services: Data migration readiness, cutover planning, business analysis, change management.`,
  },
  {
    title: "CWW Service Overview — Program and Project Advisory",
    docType: "service_description",
    content: `CWW Project Delivery provides program and project advisory, project services, test management, business analysis, change management and project administration, across industries including local government and healthcare.

CWW's value is grounded in practical delivery experience, advisory judgement, governance discipline and executive communication — identifying risks, gaps and required actions across complex implementation programs, while leaving final professional judgement with the Principal Consultant.`,
  },
];

const FTS_AVAILABLE_FALLBACK_LIMIT = 3;

function localKeywordSearch(query: string, limit = FTS_AVAILABLE_FALLBACK_LIMIT): KbDocument[] {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);

  if (terms.length === 0) return SAMPLE_DOCS.slice(0, limit);

  const scored = SAMPLE_DOCS.map((doc) => {
    const haystack = (doc.title + " " + doc.content).toLowerCase();
    const score = terms.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
    return { doc, score };
  });

  const matched = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  return (matched.length > 0 ? matched : scored).slice(0, limit).map((s) => s.doc);
}

/**
 * Retrieves the most relevant knowledge base documents for a query.
 *
 * Tries Supabase Postgres full-text search first (real, query-grounded
 * retrieval against the babypm_kb_documents table). Falls back to a simple local
 * keyword match over SAMPLE_DOCS if Supabase isn't configured yet, or if
 * the table is empty — so the demo always has something to show.
 */
export async function retrieveRelevantDocuments(query: string, limit = 3): Promise<{
  documents: KbDocument[];
  source: "supabase" | "local-fallback";
}> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("babypm_kb_documents")
        .select("title, doc_type, content")
        .textSearch("content", query, { type: "websearch", config: "english" })
        .limit(limit);

      if (!error && data && data.length > 0) {
        return {
          documents: data.map((d) => ({ title: d.title, docType: d.doc_type, content: d.content })),
          source: "supabase",
        };
      }
    } catch {
      // fall through to local fallback below
    }
  }

  return { documents: localKeywordSearch(query, limit), source: "local-fallback" };
}
