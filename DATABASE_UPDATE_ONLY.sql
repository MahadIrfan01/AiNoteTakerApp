-- ============================================
-- DATABASE UPDATE FOR AUTHENTICATION
-- ============================================
-- Copy and paste this ENTIRE file into your Supabase SQL Editor
-- Then click "RUN" to update your database
-- ============================================

-- Step 1: Add user_id columns for multi-user support
ALTER TABLE classes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Add status and scheduled_date columns to quiz_results if they don't exist
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON classes(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_status ON quiz_results(status);

-- Step 4: Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage their own classes" ON classes;
DROP POLICY IF EXISTS "Users can view their own classes" ON classes;
DROP POLICY IF EXISTS "Users can insert their own classes" ON classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON classes;

DROP POLICY IF EXISTS "Users can view notes from their classes" ON notes;
DROP POLICY IF EXISTS "Users can insert notes to their classes" ON notes;
DROP POLICY IF EXISTS "Users can update notes from their classes" ON notes;
DROP POLICY IF EXISTS "Users can delete notes from their classes" ON notes;

DROP POLICY IF EXISTS "Users can view quiz results from their classes" ON quiz_results;
DROP POLICY IF EXISTS "Users can insert quiz results to their classes" ON quiz_results;

DROP POLICY IF EXISTS "Users can manage their own invitations" ON invitations;
DROP POLICY IF EXISTS "Users can manage their own reminders" ON reminders;

-- Step 5: Create RLS policies for classes
CREATE POLICY "Users can view their own classes"
  ON classes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes"
  ON classes FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own classes"
  ON classes FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Step 6: Create RLS policies for notes
CREATE POLICY "Users can view notes from their classes"
  ON notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = notes.class_id
    AND (classes.user_id = auth.uid() OR classes.user_id IS NULL)
  ));

CREATE POLICY "Users can insert notes to their classes"
  ON notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = notes.class_id
    AND (classes.user_id = auth.uid() OR classes.user_id IS NULL)
  ));

CREATE POLICY "Users can update notes from their classes"
  ON notes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = notes.class_id
    AND (classes.user_id = auth.uid() OR classes.user_id IS NULL)
  ));

CREATE POLICY "Users can delete notes from their classes"
  ON notes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = notes.class_id
    AND (classes.user_id = auth.uid() OR classes.user_id IS NULL)
  ));

-- Step 7: Create RLS policies for quiz_results
CREATE POLICY "Users can view quiz results from their classes"
  ON quiz_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = quiz_results.class_id
    AND (classes.user_id = auth.uid() OR classes.user_id IS NULL)
  ));

CREATE POLICY "Users can insert quiz results to their classes"
  ON quiz_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = quiz_results.class_id
    AND (classes.user_id = auth.uid() OR classes.user_id IS NULL)
  ));

-- Step 8: Create RLS policies for invitations
CREATE POLICY "Users can manage their own invitations"
  ON invitations FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Step 9: Create RLS policies for reminders
CREATE POLICY "Users can manage their own reminders"
  ON reminders FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- SUCCESS! Your database is now updated with:
-- ✓ user_id columns added to classes, invitations, and reminders
-- ✓ RLS policies configured for multi-user support
-- ✓ Backward compatibility for existing data (user_id IS NULL)
-- ✓ All indexes created for optimal performance
--
-- You can now add classes and use all features!
-- ============================================
