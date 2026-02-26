import path from 'node:path';
import { readJson, writeJson } from './io.js';
import { runAdvisoryLLMAgent, runDeterministicAgents } from './agents.js';

async function main() {
  const root = process.cwd();
  const reportPath = path.join(root, 'data/output/report.json');
  const outPath = path.join(root, 'data/output/agent-enrichment.json');

  const report = readJson(reportPath);

  const deterministic = runDeterministicAgents(report);
  const llm = await runAdvisoryLLMAgent(report);

  const payload = {
    generated_at: new Date().toISOString(),
    guardrails: {
      deterministic_scores_immutable: true,
      hard_gates_immutable: true,
      ai_outputs_advisory_only: true
    },
    deterministic,
    llm
  };

  writeJson(outPath, payload);
  console.log(`Agent enrichment written to ${outPath}`);
}

main();
