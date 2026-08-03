import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Finding, WebTestReport } from "./types.js";

/** Write machine-readable and human-readable artifacts for a web test run. */
export async function writeReports(runDir: string, report: WebTestReport): Promise<string> {
  const resultsPath = path.join(runDir, "results.json");
  const markersPath = path.join(runDir, "markers.json");
  const htmlPath = path.join(runDir, "report.html");
  const markdownPath = path.join(runDir, "RUN-REPORT.md");
  await writeFile(resultsPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markersPath, `${JSON.stringify(report.evidence.annotations, null, 2)}\n`);
  const screenshots = report.evidence.screenshots;
  const imageMarkup = await Promise.all(
    screenshots.map(async (relative) => {
      const data = await readFile(path.join(runDir, relative));
      return `<figure><img src="data:image/png;base64,${data.toString("base64")}" alt="${escapeHtml(relative)}"><figcaption>${escapeHtml(relative)}</figcaption></figure>`;
    }),
  );
  const videoPath = path.join(runDir, "video.mp4");
  const video = await readFile(videoPath).catch(() => undefined);
  const passed = report.assertions.filter((assertion) => assertion.status === "pass").length;
  const failedAssertions = report.assertions.filter((assertion) => assertion.status !== "pass").length;
  const failed = report.run.status !== "pass";
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(report.scenarioTestCase.name)}</title>
<style>body{font:15px system-ui,sans-serif;max-width:1100px;margin:32px auto;padding:0 20px;color:#172033}h1{color:#174a7c}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccd5df;padding:8px;text-align:left;vertical-align:top}th{background:#eaf1f7}.pass{color:#167447}.fail{color:#b42318}figure{display:inline-block;width:45%;vertical-align:top;margin:10px}figure img{max-width:100%;border:1px solid #ccd5df}video{max-width:100%;border:1px solid #ccd5df}.finding{border-left:4px solid #b42318;padding:8px 12px;background:#fff3f2}</style></head><body>
<h1>${escapeHtml(report.scenarioTestCase.name)}</h1><p><strong class="${failed ? "fail" : "pass"}">${failed ? "FAIL" : "PASS"}</strong> — ${passed} assertions passed, ${failedAssertions} failed</p>
<h2>Steps</h2><table><thead><tr><th>Step</th><th>Action</th><th>Value</th><th>Status</th><th>Evidence</th></tr></thead><tbody>
${report.steps.map((step) => `<tr><td>${escapeHtml(step.description ?? step.id)}</td><td>${escapeHtml(step.action)}</td><td>${escapeHtml(step.value ?? "")}</td><td class="${step.status === "pass" ? "pass" : "fail"}">${step.status}</td><td>${escapeHtml(step.screenshotRef ?? "")}</td></tr>`).join("")}
</tbody></table><h2>Assertions</h2><table><thead><tr><th>Assertion</th><th>Expected</th><th>Actual</th><th>Status</th></tr></thead><tbody>
${report.assertions.map((assertion) => `<tr><td>${escapeHtml(assertion.message ?? assertion.id)}</td><td>${escapeHtml(String(assertion.expected))}</td><td>${escapeHtml(String(assertion.actual ?? assertion.message ?? ""))}</td><td class="${assertion.status === "pass" ? "pass" : "fail"}">${assertion.status}</td></tr>`).join("")}
</tbody></table><h2>Video</h2>${video ? `<video controls src="data:video/mp4;base64,${video.toString("base64")}"></video>` : "<p>Video unavailable.</p>"}
<h2>Screenshots</h2>${imageMarkup.join("")}<h2>Findings</h2>${report.findings.length ? report.findings.map(renderFinding).join("") : "<p>No findings.</p>"}</body></html>`;
  await writeFile(htmlPath, html);
  await writeFile(markdownPath, markdownReport(report));
  return markdownPath;
}

/** Render the concise Markdown report with inline screenshot links. */
export function markdownReport(report: WebTestReport): string {
  const failedAssertions = report.assertions.filter((assertion) => assertion.status !== "pass").length;
  const failed = report.run.status !== "pass";
  const lines = [
    `# ${report.scenarioTestCase.name}`,
    "",
    `**Result:** ${failed ? "FAIL" : "PASS"}  `,
    `**Assertions:** ${report.assertions.filter((assertion) => assertion.status === "pass").length} passed, ${failedAssertions} failed`,
    "",
    "## Reproduction steps",
    ...report.steps.map((step, index) => `${index + 1}. ${escapeHtml(step.description ?? step.action)}${step.value !== undefined ? ` — value: \`${escapeHtml(step.value)}\`` : ""}`),
    "",
    "## Assertions",
    ...report.assertions.map((assertion) => `- **${assertion.status.toUpperCase()}** ${escapeHtml(assertion.message ?? assertion.id)} (expected \`${escapeHtml(String(assertion.expected))}\`, actual \`${escapeHtml(String(assertion.actual ?? ""))}\`)`),
    "",
    "## Screenshots",
    ...report.evidence.screenshots.map((screenshot) => `![${screenshot}](${screenshot})`),
    "",
    "## Findings",
    ...(report.findings.length ? report.findings.map((finding) => `- **${escapeHtml(finding.severity.toUpperCase())}** ${escapeHtml(finding.title)}: ${escapeHtml(finding.actual)}`) : ["- None"]),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function renderFinding(finding: Finding): string {
  return `<div class="finding"><strong>${escapeHtml(finding.severity.toUpperCase())}: ${escapeHtml(finding.title)}</strong><p>${escapeHtml(finding.actual)}</p></div>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
