# Supabase Setup Guide

## 1. Project Initialization
1. Create a new Supabase project.
2. Link your local environment: `npx supabase link --project-ref <your-project-ref>`

## 2. Database Schema

### Tables
1.  **`user_usage`**: Tracks user credits.
    *   `user_id` (uuid, PK, references auth.users)
    *   `credits` (int, default 100)
    *   `total_usage` (int)
    *   `updated_at` (timestamp)
2.  **`credit_transactions`**: Logs credit history.
    *   `id` (uuid, PK)
    *   `user_id` (uuid)
    *   `amount` (int) - Negative for consumption, positive for grants.
    *   `description` (text)
    *   `metadata` (jsonb)
    *   `created_at` (timestamp)

### Stored Procedures (RPC)
*   **`deduct_credits`**:
    *   **Params**: `p_user_id`, `p_amount`, `p_description`, `p_metadata`
    *   **Logic**: Atomically checks balance, deducts credits, logs transaction, updates timestamp. Returns new balance.

### Row Level Security (RLS)
*   **`user_usage`**: Users can view their own usage. Service role can update.
*   **`credit_transactions`**: Users can view their own history.

## 3. Edge Functions
Deploy the following functions:
```bash
npx supabase functions deploy generate-image
npx supabase functions deploy optimize-title
npx supabase functions deploy proxy-image
```

## 4. Environment Variables & Secrets

### Local (`.env.local`)
```env
REACT_APP_SUPABASE_URL=https://<project>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
```

### Remote Secrets (Set via Dashboard or CLI)
For `generate-image` and `optimize-title`:
*   `OPENROUTER_API_KEY`: Key for OpenRouter (Title Optimization).
*   `POLLINATIONS_TOKEN`: (Optional) Token for Pollinations AI, though likely not strictly enforced yet.

## 5. Auth Setup
1. Enable Google/GitHub providers in Supabase Dashboard.
2. Configure Success URL to `http://localhost:3000` (dev) or your production URL.