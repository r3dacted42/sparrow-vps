const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPERBASE_DB_URL;
const supabaseKey = process.env.SUPERBASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration. Check your environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;