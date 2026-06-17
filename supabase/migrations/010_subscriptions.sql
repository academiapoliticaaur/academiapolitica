-- Migration 010: Subscription fields on parent_profiles
-- Abonament gestionat de admin (nu self-service): plan + dată expirare + cine a activat

ALTER TABLE parent_profiles
  ADD COLUMN IF NOT EXISTS subscription_plan       TEXT
    CHECK (subscription_plan IN ('monthly', 'quarterly', 'annual')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_activated_by UUID REFERENCES auth.users(id);

-- Index pentru interogări rapide (ex: verificare la fiecare lecție)
CREATE INDEX IF NOT EXISTS idx_parent_profiles_subscription
  ON parent_profiles(subscription_expires_at)
  WHERE subscription_expires_at IS NOT NULL;
