import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://llrpfivrrtoihkshlgvy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscnBmaXZycnRvaWhrc2hsZ3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNjEzNjQsImV4cCI6MjA1MzczNzM2NH0.QUap0VzwLOMhfP6rkj4m8bSRejylere7GlxzcrGQ6uI'

export const supabase = createClient(supabaseUrl, supabaseKey)
