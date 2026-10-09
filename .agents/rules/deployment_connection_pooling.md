# Deployment & Database Connection Pooling Rule

1. **Pure Build Commands**:
   - Web service build commands in `render.yaml` or CI/CD pipelines must only run compilation tasks (`npm install && npm run build`).
   - Never execute `npx prisma db push` or seed scripts in the build step, as concurrent builds easily exceed database connection pool limits (`EMAXCONNSESSION`).

2. **Connection String Parameters**:
   - Always append `?connection_limit=5` (or appropriate pool size) to pooled connection URLs when connecting to transaction/session poolers (e.g. Supabase, PgBouncer).
