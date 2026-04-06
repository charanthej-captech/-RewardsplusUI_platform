import * as fs from 'fs';
import * as path from 'path';

const ENV_DIR = 'env';

export interface AppConfig {
  baseUrl: string;
  client: string;
  env: string;
}

function getConfigContext(): { client: string; env: string } {
  const client = process.env.CLIENT;
  const env = process.env.ENV;

  if (!client || !env) {
    throw new Error(
      'Missing required env vars. Set CLIENT and ENV before running.\n' +
      'Example: CLIENT=santander ENV=pre npx playwright test\n' +
      'PowerShell: $env:CLIENT="santander"; $env:ENV="pre"; npx playwright test'
    );
  }

  return { client, env };
}

function parseEnvFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (key) result[key] = value;
  }

  return result;
}

export function loadConfig(): AppConfig {
  const { client, env } = getConfigContext();
  const envPath = path.resolve(process.cwd(), ENV_DIR, client, `.env.${env}`);

  if (!fs.existsSync(envPath)) {
    throw new Error(
      `Config file not found: ${envPath}\n` +
      `Expected: env/${client}/.env.${env}`
    );
  }

  const vars = parseEnvFile(envPath);
  const baseUrl = vars.BASE_URL || vars.baseUrl;

  if (!baseUrl) {
    throw new Error(`BASE_URL is not set in ${envPath}`);
  }

  return { baseUrl, client, env };
}
