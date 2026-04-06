#!/usr/bin/env node
/**
 * Post Playwright test results summary to a Slack channel.
 * Reads:  test-results/results.json  (Playwright JSON reporter)
 *         env/<CLIENT>/.env.<ENV>     (for SLACK_WEBHOOK_URL)
 * Usage:  node scripts/notify-slack.js
 * Env:    CLIENT=santander ENV=pre
 */

const fs   = require('fs');
const path = require('path');

// ── Read env file ────────────────────────────────────────────────────────────
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const line of fs.readFileSync(filePath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return result;
}

const client     = process.env.CLIENT ?? 'santander';
const env        = process.env.ENV    ?? 'pre';
const envVars    = parseEnvFile(path.resolve(__dirname, '..', 'env', client, `.env.${env}`));
const WEBHOOK    = process.env.SLACK_WEBHOOK_URL ?? envVars.SLACK_WEBHOOK_URL;

if (!WEBHOOK) {
  console.error('SLACK_WEBHOOK_URL not set — skipping Slack notification.');
  process.exit(0);
}

// ── Read results ─────────────────────────────────────────────────────────────
const resultsFile = path.resolve(__dirname, '..', 'test-results', 'results.json');
if (!fs.existsSync(resultsFile)) {
  console.error('test-results/results.json not found — run tests first.');
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));

// ── Parse results ─────────────────────────────────────────────────────────────
const tests = { passed: [], failed: [], skipped: [] };

function collectSpecs(suites) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const status = test.results?.[0]?.status ?? 'unknown';
        const title  = spec.title;
        if (status === 'passed')  tests.passed.push(title);
        else if (status === 'skipped') tests.skipped.push(title);
        else tests.failed.push(title);
      }
    }
    collectSpecs(suite.suites);
  }
}
collectSpecs(report.suites);

const total   = tests.passed.length + tests.failed.length + tests.skipped.length;
const allPass = tests.failed.length === 0;
const icon    = allPass ? ':white_check_mark:' : ':red_circle:';
const colour  = allPass ? '#2eb886' : '#e01e5a';
const duration = report.stats
  ? `${((report.stats.duration ?? 0) / 1000).toFixed(1)}s`
  : 'N/A';

// ── Build Slack message ───────────────────────────────────────────────────────
const summaryLines = [
  `*Total:* ${total}   *Passed:* ${tests.passed.length}   *Failed:* ${tests.failed.length}   *Skipped:* ${tests.skipped.length}`,
  `*Duration:* ${duration}   *Client:* ${client}   *Env:* ${env}`,
];

if (tests.failed.length > 0) {
  summaryLines.push('\n*Failed tests:*');
  for (const t of tests.failed) summaryLines.push(`  • ${t}`);
}

const payload = {
  attachments: [
    {
      color: colour,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${icon} Santander UI Automation — ${allPass ? 'All Tests Passed' : 'Tests Failed'}`,
          },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: summaryLines.join('\n') },
        },
      ],
    },
  ],
};

// ── Send ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    const res = await fetch(WEBHOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (res.ok) {
      console.log('Slack notification sent successfully.');
    } else {
      console.error(`Slack responded with ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error('Failed to send Slack notification:', err.message);
  }
})();
