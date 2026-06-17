import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { dedupeAndRenumberSources } from "@/lib/sources";
import type {
  AgentStatus,
  Finding,
  ResearchState,
  Source,
  StreamEvent
} from "@/lib/types";
import { runResearcher } from "@/agents/researcher";
import { runSupervisor } from "@/agents/supervisor";
import { runSynthesizer } from "@/agents/synthesizer";

type ResearchGraphEmit = (
  type: StreamEvent["type"],
  payload?: Record<string, unknown>
) => void | Promise<void>;

type RunResearchGraphInput = {
  topic: string;
  emit?: ResearchGraphEmit;
  formatAgentError?: (message: string) => string;
  logDuration?: (label: string, durationMs: number) => void;
};

type BuildResearchGraphOptions = Omit<RunResearchGraphInput, "topic">;

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

function readableError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown researcher error";
}

function createNoopEmit(): ResearchGraphEmit {
  return () => undefined;
}

function passthroughAgentError(message: string): string {
  return message;
}

function createResearchGraphNodes({
  emit = createNoopEmit(),
  formatAgentError = passthroughAgentError,
  logDuration
}: BuildResearchGraphOptions) {
  async function supervisorNode(
    state: typeof ResearchAnnotation.State
  ): Promise<Partial<ResearchState>> {
    const startedAt = Date.now();

    await emit("agent_started", {
      agent: "Supervisor Agent",
      message: "Breaking the topic into 3 focused sub-questions."
    });

    const subQuestions = await runSupervisor(state.topic);
    const durationMs = Date.now() - startedAt;
    logDuration?.("Supervisor", durationMs);

    await emit("agent_completed", {
      agent: "Supervisor Agent",
      message: "Generated 3 focused sub-questions.",
      durationMs
    });
    await emit("subquestions_ready", { subQuestions });

    return {
      subQuestions,
      status: "supervisor_completed"
    };
  }

  async function researchersNode(
    state: typeof ResearchAnnotation.State
  ): Promise<Partial<ResearchState>> {
    const subQuestions = state.subQuestions.slice(0, 3);

    for (const [index, subQuestion] of subQuestions.entries()) {
      await emit("agent_started", {
        agent: `Researcher Agent ${index + 1}`,
        message: subQuestion
      });
    }

    const findings = await Promise.all(
      subQuestions.map(async (subQuestion, index): Promise<Finding> => {
        const researcherId = index + 1;
        const startedAt = Date.now();

        try {
          const finding = await runResearcher(researcherId, subQuestion);
          const durationMs = Date.now() - startedAt;
          logDuration?.(`Researcher ${researcherId}`, durationMs);

          if (finding.error) {
            await emit("agent_failed", {
              agent: `Researcher Agent ${researcherId}`,
              message: formatAgentError(finding.error),
              durationMs
            });
          } else {
            await emit("agent_completed", {
              agent: `Researcher Agent ${researcherId}`,
              message: `Found ${finding.sources.length} sources.`,
              durationMs
            });
          }

          return finding;
        } catch (error) {
          const durationMs = Date.now() - startedAt;
          const message = readableError(error);
          logDuration?.(`Researcher ${researcherId}`, durationMs);

          await emit("agent_failed", {
            agent: `Researcher Agent ${researcherId}`,
            message: formatAgentError(message),
            durationMs
          });

          return {
            researcherId,
            subQuestion,
            summary: "",
            keyPoints: [],
            sources: [],
            error: message
          };
        }
      })
    );
    const normalized = dedupeAndRenumberSources(findings);
    const hasSuccess = normalized.findings.some((finding) => !finding.error);

    await emit("sources_ready", { sources: normalized.sources });

    return {
      findings: normalized.findings,
      sources: normalized.sources,
      researchCompleted: true,
      status: "research_completed",
      error: hasSuccess ? null : "All researcher agents failed."
    };
  }

  async function synthesizerNode(
    state: typeof ResearchAnnotation.State
  ): Promise<Partial<ResearchState>> {
    await emit("synthesis_started", {
      message: "Combining successful findings into a cited report."
    });
    await emit("agent_started", {
      agent: "Synthesis Agent",
      message: "Writing the structured markdown report."
    });

    const startedAt = Date.now();
    const report = await runSynthesizer({
      ...state,
      status: "synthesis_running"
    });
    const durationMs = Date.now() - startedAt;
    logDuration?.("Synthesis", durationMs);

    await emit("agent_completed", {
      agent: "Synthesis Agent",
      message: "Completed the cited research report.",
      durationMs
    });

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

    await emit("agent_failed", {
      agent: "Synthesis Agent",
      message: "Synthesis skipped because all researchers failed."
    });

    return {
      report,
      status: "failed",
      error: state.error ?? "All researcher agents failed."
    };
  }

  return {
    failedNode,
    researchersNode,
    supervisorNode,
    synthesizerNode
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

export function buildResearchGraph(options: BuildResearchGraphOptions = {}) {
  const { failedNode, researchersNode, supervisorNode, synthesizerNode } =
    createResearchGraphNodes(options);

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

export async function runResearchGraph(
  input: string | RunResearchGraphInput
): Promise<ResearchState> {
  const options = typeof input === "string" ? { topic: input } : input;
  const graph = buildResearchGraph(options);
  return graph.invoke(createInitialResearchState(options.topic));
}
