import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { dedupeAndRenumberSources } from "@/lib/sources";
import type { AgentStatus, Finding, ResearchState, Source } from "@/lib/types";
import { runResearcher } from "@/agents/researcher";
import { runSupervisor } from "@/agents/supervisor";
import { runSynthesizer } from "@/agents/synthesizer";

export const ResearchAnnotation = Annotation.Root({
  topic: Annotation<string>(),
  subQuestions: Annotation<string[]>(),
  findings: Annotation<Finding[]>(),
  report: Annotation<string>(),
  sources: Annotation<Source[]>(),
  status: Annotation<AgentStatus>(),
  error: Annotation<string | null>(),
  researchCompleted: Annotation<boolean>()
});

export function createInitialResearchState(topic: string): ResearchState {
  return {
    topic,
    subQuestions: [],
    findings: [],
    report: "",
    sources: [],
    status: "started",
    error: null,
    researchCompleted: false
  };
}

async function supervisorNode(
  state: typeof ResearchAnnotation.State
): Promise<Partial<ResearchState>> {
  const subQuestions = await runSupervisor(state.topic);

  return {
    subQuestions,
    status: "supervisor_completed"
  };
}

async function researchersNode(
  state: typeof ResearchAnnotation.State
): Promise<Partial<ResearchState>> {
  const findings = await Promise.all(
    state.subQuestions.slice(0, 3).map(async (subQuestion, index) => {
      try {
        return await runResearcher(index + 1, subQuestion);
      } catch (error) {
        return {
          researcherId: index + 1,
          subQuestion,
          summary: "",
          keyPoints: [],
          sources: [],
          error:
            error instanceof Error ? error.message : "Unknown researcher error"
        };
      }
    })
  );
  const normalized = dedupeAndRenumberSources(findings);
  const hasSuccess = normalized.findings.some((finding) => !finding.error);

  return {
    findings: normalized.findings,
    sources: normalized.sources,
    researchCompleted: true,
    status: "research_completed",
    error: hasSuccess ? null : "All researcher agents failed."
  };
}

function routerCheckNode(
  state: typeof ResearchAnnotation.State
): Partial<ResearchState> {
  return {
    status: state.status
  };
}

function routeAfterResearch(state: typeof ResearchAnnotation.State) {
  if (
    state.researchCompleted &&
    state.findings.some((finding) => !finding.error)
  ) {
    return "synthesize";
  }

  return "failed";
}

async function synthesizerNode(
  state: typeof ResearchAnnotation.State
): Promise<Partial<ResearchState>> {
  const report = await runSynthesizer(state);

  return {
    report,
    status: "completed",
    error: null
  };
}

async function failedNode(
  state: typeof ResearchAnnotation.State
): Promise<Partial<ResearchState>> {
  const report = await runSynthesizer({
    ...state,
    status: "failed",
    error: state.error ?? "All researcher agents failed."
  });

  return {
    report,
    status: "failed",
    error: state.error ?? "All researcher agents failed."
  };
}

export function buildResearchGraph() {
  return new StateGraph(ResearchAnnotation)
    .addNode("supervisor", supervisorNode)
    .addNode("researchers_parallel", researchersNode)
    .addNode("router_check", routerCheckNode)
    .addNode("synthesizer", synthesizerNode)
    .addNode("failed", failedNode)
    .addEdge(START, "supervisor")
    .addEdge("supervisor", "researchers_parallel")
    .addEdge("researchers_parallel", "router_check")
    .addConditionalEdges("router_check", routeAfterResearch, {
      synthesize: "synthesizer",
      failed: "failed"
    })
    .addEdge("synthesizer", END)
    .addEdge("failed", END)
    .compile();
}

export async function runResearchGraph(topic: string): Promise<ResearchState> {
  const graph = buildResearchGraph();
  return graph.invoke(createInitialResearchState(topic));
}
