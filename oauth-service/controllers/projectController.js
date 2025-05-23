import client from "../config/db.js";
import { doesEntryExist } from "../utils/tableManager.js";
import { validateGitUrl } from "../utils/validation.js";

async function addProject(req, res, next) {
  try {
    const { user, repolink } = req.body;
    const tablename = "projects";
    const column = "repourl";

    if (!user || !repolink) {
      return res.status(400).json({ error: "Missing user or repository link" });
    }

    const isValid = await validateGitUrl(repolink);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid GitHub repository URL" });
    }

    const exists = await doesEntryExist(tablename, column, repolink);
    if (exists) {
      return res.status(200).json({
        message: `${repolink} repo already exists`,
      });
    }

    const { data, error } = await client.from(tablename)
      .insert([{ user: user, repourl: repolink }])
      .select();

    if (error) {
      return res.status(500).json({ error: "Database error", details: error });
    }

    return res.status(200).json({
      message: `Project added successfully to ${tablename}`,
      data: data,
    });
  } catch (error) {
    next(error);
  }
}

async function fetchRows(req, res, next) {
  try {
    const { user, table } = req.query;
    
    if (!table) {
      return res.status(400).json({ error: "Missing table parameter" });
    }

    const { data, error } = await client.from(table).select("*").eq('user',user);
    
    if (error) {
      return next(error);
    }
    return res.json(data);
  } catch (error) {
    next(error);
  }
}

export {
  addProject,
  fetchRows
};