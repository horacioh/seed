import { createInterface } from "node:readline";
import { spawn, type ChildProcess } from "node:child_process";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { runScenario } from "./runner.js";
import type { Scenario, ScenarioModule } from "./types.js";

interface CliOptions {
  url?: string;
  scenario?: string;
  cdp: string;
  out: string;
}

/** Parse the small command-line surface for the standalone harness. */
export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { cdp: "http://localhost:29229", out: "artifacts" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--url") options.url = requiredValue(argv, ++index, arg);
    else if (arg === "--scenario") options.scenario = requiredValue(argv, ++index, arg);
    else if (arg === "--cdp") options.cdp = requiredValue(argv, ++index, arg);
    else if (arg === "--out") options.out = requiredValue(argv, ++index, arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

/** Run the default, custom-scenario, or generic web workflow. */
export async function main(argv = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(argv);
  const harnessRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const scenario = await loadScenario(options, harnessRoot);
  let server: ChildProcess | undefined;
  try {
    if (!options.url && !options.scenario) {
      server = spawn(process.execPath, [path.join(harnessRoot, "sample-app", "serve.mjs")], {
        cwd: harnessRoot,
        stdio: ["ignore", "pipe", "pipe"],
      });
      await waitForReadyLine(server);
    }
    const reportPath = await runScenario(scenario, {
      cdpUrl: options.cdp,
      outputRoot: path.resolve(harnessRoot, options.out),
    });
    const runDir = path.dirname(reportPath);
    process.stdout.write(`Web harness completed: ${scenario.name}\n`);
    for (const file of ["results.json", "markers.json", "report.html", "RUN-REPORT.md", "video.mp4", "dom.html"]) {
      process.stdout.write(`${path.join(runDir, file)}\n`);
    }
    process.stdout.write(`${path.join(runDir, "frames")}\n`);
  } finally {
    server?.kill("SIGTERM");
  }
}

async function loadScenario(options: CliOptions, harnessRoot: string): Promise<Scenario> {
  if (options.scenario) {
    const module = (await import(pathToFileURL(path.resolve(options.scenario)).href)) as ScenarioModule;
    return module.scenario;
  }
  if (!options.url) {
    const module = (await import(pathToFileURL(path.join(harnessRoot, "scenarios", "sample.web.ts")).href)) as ScenarioModule;
    return module.scenario;
  }
  return {
    name: `Generic web smoke: ${options.url}`,
    description: "Navigate to a web application and verify basic document readiness.",
    steps: [
      { action: "goto", url: options.url, description: `Navigate to ${options.url}` },
      { action: "assert", kind: "title", expected: true, description: "Page title is non-empty" },
      { action: "assert", kind: "visible", locator: { css: "body" }, expected: true, description: "Page body is visible" },
    ],
  };
}

function requiredValue(argv: string[], index: number, option: string): string {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`${option} requires a value`);
  return value;
}

function waitForReadyLine(server: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server.stdout) {
      reject(new Error("Sample server stdout is unavailable"));
      return;
    }
    const lines = createInterface({ input: server.stdout });
    lines.on("line", (line) => {
      if (line.startsWith("HARNESS_SAMPLE_READY ")) {
        lines.close();
        resolve();
      }
    });
    server.once("error", reject);
    server.stderr?.on("data", (chunk: Buffer) => process.stderr.write(chunk));
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
      process.exit(1);
    });
}
