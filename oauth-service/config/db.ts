import { createClient } from "@supabase/supabase-js";
import { SupaBaseEnv } from "../helper/types";

const { SUPABASE_DB_URL, SUPABASE_API_KEY } = process.env as Partial<SupaBaseEnv>; 

if (!SUPABASE_DB_URL || !SUPABASE_API_KEY) {
  console.error("Missing environment variables.");
  process.exit(1);
}
const supabase = createClient(SUPABASE_DB_URL, SUPABASE_API_KEY);

export default supabase;
