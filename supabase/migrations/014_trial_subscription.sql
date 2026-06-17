-- Migration 014: Add 'trial' plan + auto-trial for new family accounts
-- Trial = 7 zile gratuit, activat automat la înregistrare cont family

-- Extinde constraint plan să includă 'trial'
ALTER TABLE parent_profiles DROP CONSTRAINT IF EXISTS parent_profiles_subscription_plan_check;
ALTER TABLE parent_profiles ADD CONSTRAINT parent_profiles_subscription_plan_check
  CHECK (subscription_plan IN ('trial', 'monthly', 'quarterly', 'annual'));
