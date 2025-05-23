import client from "../config/db.js";
import { doesEntryExist } from "../utils/tableManager.js";

async function checkUser(req, res, next) {
  try {
    const username = req.query.username;
    const exists = await doesEntryExist("users_superset", "username", username);
    res.json({ exists });
  } catch (error) {
    next(error);
  }
}

async function checkSessionStatus(req, res, next) {
  const username = req.query.username;
  const sessionLimit = 1;
  
  try {
    const { data, error } = await client.from("users_superset")
      .select("modified_date")
      .eq("username", username);

    if (error) {
      return next(error);
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const firstSession = new Date(data[0].modified_date);
    const currTime = new Date();
    const currSession = Math.floor((currTime - firstSession) / 60000);

    return res.json({ expired: currSession >= sessionLimit });
  } catch (error) {
    next(error);
  }
}


async function insertData(req, res, next) {
  try {
    const { table_name, insert_object } = req.body;

    const { data, error } = await client.from(table_name)
      .insert([insert_object])
      .select();

    if (error) {
      return res.status(500).json({ 
        error: "Database error", 
        details: error 
      });
    }

    return res.status(200).json({
      message: `Data inserted into ${table_name} successfully`,
      data: data,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { username, column, newValue } = req.body;

    if (!username || !column || newValue === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields" 
      });
    }

    const updateObject = {};
    updateObject[column] = newValue;

    const { data, error } = await client.from("users_superset")
      .update(updateObject)
      .eq("username", username)
      .select();

    if (error) {
      return res.status(500).json({ 
        error: "Database error", 
        details: error 
      });
    }

    return res.status(200).json({ 
      message: "Updated successfully", 
      data: data 
    });
  } catch (error) {
    next(error);
  }
}

export { 
  checkUser,
  checkSessionStatus,
  insertData,
  updateUser
};