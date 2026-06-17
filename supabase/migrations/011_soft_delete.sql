-- WP18: Soft delete pentru cursuri, module, lecții
-- Adaugă coloana deleted_at pe cele 3 tabele.
-- Elementele cu deleted_at IS NOT NULL sunt considerate șterse și ignorate de queries.

ALTER TABLE courses  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE modules  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE lessons  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Indexuri parțiale pentru filtrare rapidă (IS NULL e cel mai comun caz)
CREATE INDEX IF NOT EXISTS idx_courses_not_deleted ON courses (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_modules_not_deleted ON modules (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_not_deleted ON lessons (id) WHERE deleted_at IS NULL;
