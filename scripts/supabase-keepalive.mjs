#!/usr/bin/env node

/**
 * Supabase keepalive script.
 * Uses a lightweight REST query to keep the project active.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Load environment files for local runs.
const envCandidates = [".env.local", ".env"];
for (const envFile of envCandidates) {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.REACT_APP_SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.REACT_APP_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY;

const KEEPALIVE_PATH =
  process.env.SUPABASE_KEEPALIVE_PATH ?? "/rest/v1/user_usage?select=user_id&limit=1";
const REQUEST_TIMEOUT_MS = Number(process.env.SUPABASE_KEEPALIVE_TIMEOUT_MS ?? 15000);

function fail(message) {
  console.error(`[supabase-keepalive] ${message}`);
  process.exit(1);
}

if (!SUPABASE_URL) fail("Missing SUPABASE_URL (or REACT_APP_SUPABASE_URL / VITE_SUPABASE_URL).");
if (!SUPABASE_ANON_KEY) {
  fail(
    "Missing Supabase API key (SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY / REACT_APP_* / VITE_*)."
  );
}
if (!KEEPALIVE_PATH.startsWith("/")) {
  fail("SUPABASE_KEEPALIVE_PATH must start with '/'.");
}

const endpoint = new URL(KEEPALIVE_PATH, SUPABASE_URL).toString();
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

try {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json",
      "User-Agent": "coverview-keepalive/1.0"
    },
    signal: controller.signal
  });

  const bodyText = await response.text();
  clearTimeout(timeout);

  if (!response.ok) {
    fail(
      `Request failed: HTTP ${response.status} ${response.statusText}. Body: ${bodyText.slice(
        0,
        500
      )}`
    );
  }

  console.log(
    `[supabase-keepalive] OK ${new Date().toISOString()} - ${response.status} ${response.statusText}`
  );
} catch (error) {
  clearTimeout(timeout);
  if (error?.name === "AbortError") {
    fail(`Request timeout after ${REQUEST_TIMEOUT_MS}ms.`);
  }
  if (error instanceof Error && error.cause) {
    fail(`Unexpected error: ${error.message}. Cause: ${String(error.cause)}`);
  }
  fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
}