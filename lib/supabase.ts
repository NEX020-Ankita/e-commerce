import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zpjrvqmlzsbpalttpfuy.supabase.co'
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwanJ2cW1senNicGFsdHRwZnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzIwOTcsImV4cCI6MjA3NzkwODA5N30.aHp3WEEGtUNqcQWay5iAqUsuDzmje2mcAUWT8aKsBnE";

export const supabase = createClient(supabaseUrl, supabaseKey)