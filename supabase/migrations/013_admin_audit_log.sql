-- Tabel audit log acțiuni admin
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action  ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin   ON admin_audit_log(admin_id);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
-- Doar service_role poate citi/scrie (admin client bypass RLS)
