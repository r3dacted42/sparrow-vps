import client from "../config/db";

async function doesEntryExist(
  tablename: string, 
  column: string, 
  value: string | number | boolean
): Promise<boolean> {
  try {
    const { data, error } = await client.from(tablename)
      .select(column)
      .eq(column, value)
      .limit(1);
      
    if (error) {
      console.log("Supabase error:", error);
      return false;
    }
    
    return data.length > 0;
  } catch (error) {
    console.error("Server error:", error);
    return false;
  }
}

export {
  doesEntryExist
};