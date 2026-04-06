/**
 * Custom Playwright reporter — posts test results to Slack after every run.
 * Reads SLACK_WEBHOOK_URL from env/<CLIENT>/.env.<ENV>
 */

const fs   = require('fs');
const path = require('path');

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

class SlackReporter {
  constructor() {
    this.passed   = [];
    this.failed   = [];
    this.skipped  = [];
    this.startTime = Date.now();
  }

  onBegin(_config, _suite) {
    this.startTime = Date.now();
  }

  onTestEnd(test, result) {
    // Skip intermediate retries — only record the final outcome
    if (result.status !== 'passed' && result.retry < test.retries) return;

    const title = test.title;
    if (result.status === 'passed')        this.passed.push(title);
    else if (result.status === 'skipped')  this.skipped.push(title);
    else                                   this.failed.push(title);
  }

  async onEnd(_result) {
    const client  = process.env.CLIENT ?? 'santander';
    const env     = process.env.ENV    ?? 'pre';
    const envVars = parseEnvFile(
      path.resolve(process.cwd(), 'env', client, `.env.${env}`)
    );
    const WEBHOOK = process.env.SLACK_WEBHOOK_URL ?? envVars.SLACK_WEBHOOK_URL;

    if (!WEBHOOK) {
      console.log('[SlackReporter] SLACK_WEBHOOK_URL not set — skipping notification.');
      return;
    }

    const total    = this.passed.length + this.failed.length + this.skipped.length;
    const allPass  = this.failed.length === 0;
    const icon     = allPass ? ':white_check_mark:' : ':red_circle:';
    const colour   = allPass ? '#2eb886' : '#e01e5a';
    const duration = `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`;

    const reportUrl = process.env.REPORT_URL ?? null;

    const summaryLines = [
      `*Total:* ${total}   *Passed:* ${this.passed.length}   *Failed:* ${this.failed.length}   *Skipped:* ${this.skipped.length}`,
      `*Duration:* ${duration}   *Client:* ${client}   *Env:* ${env}`,
    ];

    if (this.failed.length > 0) {
      summaryLines.push('\n*Failed tests:*');
      for (const t of this.failed) summaryLines.push(`  • ${t}`);
    }

    const blocks = [
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
    ];

    if (reportUrl) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Report:* <${reportUrl}|View Test Report>` },
      });
    }

    const payload = {
      attachments: [
        {
          color: colour,
          blocks,
        },
      ],
    };

    try {
      const res = await fetch(WEBHOOK, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (res.ok) {
        console.log('[SlackReporter] Notification sent successfully.');
      } else {
        console.error(`[SlackReporter] Slack responded ${res.status}: ${await res.text()}`);
      }
    } catch (err) {
      console.error('[SlackReporter] Failed to send notification:', err.message);
    }
  }
}

module.exports = SlackReporter;
