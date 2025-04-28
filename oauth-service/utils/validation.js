const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

/**
 * Validate a GitHub repository URL
 * @param {string} gitUrl - GitHub repository URL
 * @returns {Promise<boolean>} - Whether the URL is valid
 */
async function validateGitUrl(gitUrl) {
  try {
    const parseUrl = new URL(gitUrl);
    const splitUrl = parseUrl.pathname.split("/").filter(Boolean);
    
    if (splitUrl.length < 2) {
      return false;
    }
    
    const owner = splitUrl[0];
    const repo = splitUrl[1].replace(".git", "");
    const apiEndPointUrl = `https://api.github.com/repos/${owner}/${repo}`;

    const response = await fetch(apiEndPointUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "git-repo-validator",
      },
    });

    const status = await response.json();
    return !status.message || status.message !== "Not Found";
  } catch (error) {
    console.error("URL validation error:", error);
    return false;
  }
}

module.exports = {
  validateGitUrl
};