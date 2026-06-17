-- Migration 017: Sistem vouchere pentru activare abonamente
-- Aplică în Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'annual')),
  notes TEXT,
  valid_until TIMESTAMPTZ,           -- data expirare voucher (nu abonament)
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ
);

-- Index pentru lookup rapid al codului la răscumpărare
CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers (UPPER(code));

-- RLS: acces blocat direct (toate operațiunile se fac via admin client în Server Actions)
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vouchers_no_direct_access" ON vouchers FOR ALL USING (false);
