# Multi-Tenant Data & Domain Isolation Rule

1. **Mandatory Tenant Scoping**:
   - Every API endpoint (`/api/v1/*`, `/api/auth/me`, dashboard routes) MUST resolve the caller's workspace via `getAuthContext(req)` and include `workspaceId: auth.workspace.id` in all Prisma read/write queries.
   - Never perform un-scoped queries (e.g., `findFirst({ where: { name: domain } })`). Always use `where: { workspaceId, name }`.

2. **Domain-Bound Activity & Logs**:
   - Users must only view logs, deliverability metrics, and send histories for domains verified under their own workspace.
   - Provide domain-level filtering on all log views so multi-domain tenants can inspect per-domain performance without ambiguity.

3. **Sender Domain Verification**:
   - The email dispatch engine (`sendEmailEngine`) must verify that the sender domain belongs to the active workspace and has status `VERIFIED` before permitting transmission.
