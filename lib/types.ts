export type Source = {
  id: number;
  title: string;
  url: string;
  snippet: string;
};

export type Finding = {
  researcherId: number;
  subQuestion: string;
  summary: string;
  keyPoints: string[];
  sources: Source[];
  error?: string | null;
};

export type AgentStatus =
  | "idle"
  | "started"
  | "supervisor_running"
  | "supervisor_completed"
  | "researchers_running"
  | "research_completed"
  | "synthesis_running"
  | "completed"
  | "failed";

export type ResearchState = {
  topic: string;
  subQuestions: string[];
  findings: Finding[];
  report: string;
  sources: Source[];
  status: AgentStatus;
  error: string | null;
  researchCompleted: boolean;
};

export type TimelineEvent = {
  id: string;
  agent: string;
  status: "running" | "completed" | "failed";
  message: string;
  durationMs?: number;
  timestamp: number;
};

export type StreamEvent = {
  type:
    | "research_started"
    | "agent_started"
    | "agent_completed"
    | "agent_failed"
    | "cache_hit"
    | "subquestions_ready"
    | "sources_ready"
    | "synthesis_started"
    | "report_ready"
    | "research_completed"
    | "error"
    | "done";
  payload?: Record<string, unknown>;
};
