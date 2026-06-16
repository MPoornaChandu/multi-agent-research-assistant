import { loadEnvConfig } from "@next/env";

type EnvCandidate = {
  value?: string;
};

type SafeEnvStatus = {
  googleApiKeyConfigured: boolean;
  tavilyApiKeyConfigured: boolean;
  geminiModelConfigured: boolean;
  fastMode: boolean;
  tavilyMaxResultsConfigured: boolean;
  nextPublicAppUrlConfigured: boolean;
  development: boolean;
};

const loadedEnvFileValues = new Map<string, string>();

function cleanEnvValue(value?: string): string {
  if (!value) return "";

  return value.trim().replace(/^["']|["']$/g, "");
}

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();

  return (
    !value ||
    lower.includes("paste_your") ||
    lower.includes("your_google") ||
    lower.includes("your_gemini") ||
    lower.includes("your_tavily") ||
    lower.includes("api_key_here") ||
    lower.includes("real_gemini") ||
    lower.includes("real_tavily")
  );
}

function parseEnvFile(contents: string) {
  const values = new Map<string, string>();

  contents.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
    if (!match) return;

    const [, name, rawValue = ""] = match;
    const value = cleanEnvValue(rawValue.replace(/\s+#.*$/, ""));
    values.set(name, value);
  });

  return values;
}

function loadRootEnvFiles() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const { loadedEnvFiles } = loadEnvConfig(
    process.cwd(),
    process.env.NODE_ENV !== "test",
    undefined,
    true
  );

  loadedEnvFileValues.clear();

  loadedEnvFiles.forEach((file) => {
    parseEnvFile(file.contents).forEach((value, name) => {
      if (!loadedEnvFileValues.has(name)) {
        loadedEnvFileValues.set(name, value);
      }
    });
  });
}

function envCandidates(...names: string[]): EnvCandidate[] {
  return names.flatMap((name) => [
    { value: process.env[name] },
    { value: loadedEnvFileValues.get(name) }
  ]);
}

function firstConfiguredValue(candidates: EnvCandidate[]) {
  return candidates
    .map((candidate) => cleanEnvValue(candidate.value))
    .find((value) => !isPlaceholder(value));
}

loadRootEnvFiles();

export function hasGoogleApiKey(): boolean {
  return Boolean(
    firstConfiguredValue(
      envCandidates("GOOGLE_API_KEY", "GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY")
    )
  );
}

export function hasTavilyApiKey(): boolean {
  return Boolean(firstConfiguredValue(envCandidates("TAVILY_API_KEY")));
}

export function getGoogleApiKey(): string {
  const value = firstConfiguredValue(
    envCandidates("GOOGLE_API_KEY", "GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY")
  );

  if (!value) {
    throw new Error(
      "Missing GOOGLE_API_KEY. Add a real value to .env.local before starting research."
    );
  }

  return value;
}

export function getTavilyApiKey(): string {
  const value = firstConfiguredValue(envCandidates("TAVILY_API_KEY"));

  if (!value) {
    throw new Error(
      "Missing TAVILY_API_KEY. Add a real value to .env.local before starting research."
    );
  }

  return value;
}

export function getGeminiModelName(): string {
  return (
    cleanEnvValue(process.env.GEMINI_MODEL || loadedEnvFileValues.get("GEMINI_MODEL")) ||
    "gemini-2.5-flash-lite"
  );
}

export function isFastMode(): boolean {
  const value = cleanEnvValue(
    process.env.FAST_MODE || loadedEnvFileValues.get("FAST_MODE")
  ).toLowerCase();

  return value !== "false";
}

export function getTavilyMaxResults(): number {
  const rawValue = cleanEnvValue(
    process.env.TAVILY_MAX_RESULTS || loadedEnvFileValues.get("TAVILY_MAX_RESULTS")
  );
  const value = Number(rawValue || "2");

  if (!Number.isFinite(value)) {
    return 2;
  }

  return Math.min(Math.max(Math.trunc(value), 1), 3);
}

export function getSafeEnvStatus(): SafeEnvStatus {
  return {
    googleApiKeyConfigured: hasGoogleApiKey(),
    tavilyApiKeyConfigured: hasTavilyApiKey(),
    geminiModelConfigured: Boolean(getGeminiModelName()),
    fastMode: isFastMode(),
    tavilyMaxResultsConfigured: getTavilyMaxResults() > 0,
    nextPublicAppUrlConfigured: Boolean(cleanEnvValue(
      process.env.NEXT_PUBLIC_APP_URL || loadedEnvFileValues.get("NEXT_PUBLIC_APP_URL")
    )),
    development: process.env.NODE_ENV !== "production"
  };
}
