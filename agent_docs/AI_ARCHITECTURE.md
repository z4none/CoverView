# AI Agent Architecture

This document describes the AI Agent capabilities integrated into CoverView.

## Capabilities

### 1. Code Generation & Editing
The agent operates directly on the codebase, capable of:
*   Reading and understanding React components.
*   Modifying Supabase Edge Functions (Deno/TypeScript).
*   Updating Database migrations (SQL).
*   Managing configurations.

### 2. Integration Patterns
*   **Edge-First**: AI logic is deployed to Supabase Edge Functions (`supabase/functions/*`).
*   **Service-Worker**: The frontend uses `aiService.js` to communicate with Edge Functions.
*   **Proxy Pattern**: `proxy-image` function handles CORS for 3rd party assets.

## Recent Work
*   **Credit System Migration**: Moved from localstorage quotas to server-side Postgres credits.
*   **Features**:
    *   Unified AI Image Generation (Pollinations).
    *   Title Optimization (OpenRouter).
    *   Profile Page for credit viewing.
    *   Unified Image Selection UI (Local/Online/AI).
    *   Image History Management (Local Storage, Delete capability).
*   **Image Sources**:
    *   Unsplash (Standard).
    *   Licyuan (Random Anime).

## Workflows
*   **New Feature**: Update schema -> Create/Update Edge Function -> Update `aiService` -> Update UI Component.
*   **Deployment**: `npx supabase functions deploy <name> --no-verify-jwt`.
