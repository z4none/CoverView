# Credit System & Usage Tracking

## Overview
CoverView uses a unified **Credit System** to manage AI feature usage. This replaces rigid quotas with a flexible "currency".

## Credit Model

### Initial Grant
*   Every new user starts with **100 Credits**.
*   This is initialized automatically when the `deduct_credits` RPC is first called (lazy initialization).

### Costs
| Feature | Cost | Description |
| :--- | :--- | :--- |
| **Title Optimization** | **1 Credit** | Generates 3 title variations using LLM. |
| **Image Generation** | **10 Credits** | Generates a custom AI image based on title. |

## Technical Implementation

### Database
*   **Balance**: Stored in `user_usage.credits`.
*   **History**: Every deduction is logged in `credit_transactions` with a description (e.g., "AI 图像生成") and metadata (e.g., `{ model: 'zimage' }`).

### Atomic Transactions
We use a PostgreSQL Stored Procedure (`deduct_credits`) to ensure data integrity:
1.  Locks the user's row (`FOR UPDATE`).
2.  Checks current balance.
3.  If insufficient: Returns error.
4.  If sufficient: Deducts amount, inserts log record.
5.  Commits transaction.

### Frontend Display
*   **Header**: Shows "Your Profile" link.
*   **Profile Page**: Displays:
    *   Current remaining credits (large display).
    *   Transaction history list (paginated).

## Future Expansion
*   **Top-up**: The system allows positive amounts in `credit_transactions` to support future credit purchase features.
*   **Refunds**: Failed generations can theoretically trigger a refund (positive transaction), though currently handled by simply not deducting if the function fails *before* the DB call (logic in Edge Functions needs to be careful about order, currently DB deducts first? No, actually code checks balance first?).
    *   *Correction*: The current implementation calls `deduct_credits` inside the Edge Function. If the AI API fails *after* deduction, we currently don't refund. This is a potential improvement area.