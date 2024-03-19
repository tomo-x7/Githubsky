import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(process.argv[2], process.argv[3])

supabase.from('test').insert({})