import client from "../config/db.js";

/**
 * Check if a table exists in the database
 * @param {string} tablename - Name of the table to check
 * @returns {Promise<boolean>} - Whether the table exists
 */
async function checkTableExists(tablename) {
  try {
    const { data, error } = await client.rpc("validatetable", {
      tablename: tablename,
    });

    if (error) {
      console.error("Error checking table existence:", error);
      throw new Error("Failed to check table existence");
    }
    
    return data;
  } catch (error) {
    console.error("Table existence check failed:", error);
    throw error;
  }
}

/**
 * Create a new table in the database
 * @param {string} tableName - Name of the table to create
 * @param {string} schemaDefinition - SQL schema definition
 * @returns {Promise<boolean>} - Success status
 */
async function createTable(tableName, schemaDefinition) {
  try {
    const { data, error } = await client.rpc("creattable", {
      table_name: tableName,
      table_definition: schemaDefinition,
    });

    if (error) {
      console.error("Error creating table:", error);
      throw new Error("Failed to create table");
    }
    
    return true;
  } catch (error) {
    console.error("Table creation failed:", error);
    throw error;
  }
}

/**
 * Check if an entry exists in a table
 * @param {string} tablename - Name of the table
 * @param {string} column - Column to check
 * @param {any} value - Value to look for
 * @returns {Promise<boolean>} - Whether the entry exists
 */
async function doesEntryExist(tablename, column, value) {
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
  checkTableExists,
  createTable,
  doesEntryExist
};