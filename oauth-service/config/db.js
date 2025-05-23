import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_DB_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration. Check your environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;