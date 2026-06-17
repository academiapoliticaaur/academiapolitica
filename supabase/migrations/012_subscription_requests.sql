-- Tabel cereri abonament (Variant B — utilizator cere, admin aprobă)
CREATE TABLE IF NOT EXISTS subscription_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan         TEXT NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'annual')),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at  TIMESTAMPTZ,
  reviewed_by  UUID REFERENCES auth.users(id)
);

-- Unicitate: un singur pending per utilizator
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_requests_one_pending
  ON subscription_requests (user_id)
  WHERE status = 'pending';

-- Index pentru queries frecvente
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON subscription_requests (status);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_user ON subscription_requests (user_id);

ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own requests" ON subscription_requests;
CREATE POLICY "Users can read own requests"
  ON subscription_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own requests" ON subscription_requests;
CREATE POLICY "Users can insert own requests"
  ON subscription_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Doar service_role poate actualiza (admin aprobă/respinge via admin client)
-- (CRUD admin se face cu service_role key care bypass RLS)
