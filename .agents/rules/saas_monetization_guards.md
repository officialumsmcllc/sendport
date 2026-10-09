# SaaS Monetization & Quota Architecture Rule

1. **Free Tier Sizing**:
   - The Free Starter tier must be sized strictly for testing and proof-of-concept (100 emails/day, 1 verified domain max).
   - Never configure free tiers with production-ready volume that eliminates the incentive to purchase paid subscriptions.

2. **Paywall & Upgrade Friction**:
   - When a tenant reaches domain or quota limits, return structured errors (e.g. `DOMAIN_LIMIT_REACHED`) and render a high-converting upgrade modal directing users to `/dashboard/billing`.
   - Enforce quota checks upfront before batch jobs and within core engines to prevent bypasses.

3. **Admin Scope Invariants**:
   - Administrative mutations that grant plans or update quotas must explicitly look up the target user's workspace membership and update ONLY that workspace. Never use unscoped `updateMany`.
