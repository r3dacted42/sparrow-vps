const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
import { GITHUB } from "../config/env.js";

async function getGithubAccessToken(req, res, next) {
  try {
    const params = 
      "?client_id=" + GITHUB.CLIENT_ID +
      "&client_secret=" + GITHUB.CLIENT_SECRET +
      "&code=" + req.query.code;
    
    const accessTokenEndPoint = `https://github.com/login/oauth/access_token${params}`;
    
    const response = await fetch(accessTokenEndPoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getGithubUserData(req, res, next) {
  try {
    const authHeader = req.get("Authorization");
    
    const response = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "User-Agent": "Node.js",
      },
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function fetchGithubRepos(req, res, next) {
  try {
    const authHeader = req.get("Authorization");
    const ghRepoFetchEndPoint = "https://api.github.com/user/repos?per_page=100&sort=updated";
    
    const response = await fetch(ghRepoFetchEndPoint, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    
    const projects = await response.json();
    
    res.json(
      projects.map((project) => ({
        full_name: project.full_name,
        html_url: project.html_url,
        visibility: project.visibility,
        created_at: project.created_at,
        language: project.language,
      }))
    );
  } catch (error) {
    next(error);
  }
}

export {
  getGithubAccessToken,
  getGithubUserData,
  fetchGithubRepos
};