-- ============================================
-- MINIMAL FIX: Only fix tables that exist
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add user_id column to classes table (REQUIRED)
ALTER TABLE classes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for classes
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON classes(user_id);

-- Step 3: Add user_id to other tables if they exist (using IF NOT EXISTS to avoid errors)
DO $$ 
BEGIN
    -- Try to add user_id to invitations if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invitations') THEN
        ALTER TABLE invitations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
    END IF;
    
    -- Try to add user_id to reminders if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reminders') THEN
        ALTER TABLE reminders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
    END IF;
END $$;

-- Step 4: Disable RLS temporarily on all tables (only if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'classes') THEN
        ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notes') THEN
        ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quiz_results') THEN
        ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invitations') THEN
        ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reminders') THEN
        ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- SUCCESS! Now try adding a class.
-- ============================================
