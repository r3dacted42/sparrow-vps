import { Request, Response, NextFunction } from "express";

import fetch from "node-fetch";
import { GITHUB } from "../config/env";
import { GitHubTokenResponse, GitHubUser } from "../helper/types";

async function getGithubAccessToken(
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authorizationCode = request.query.code as string;

        if (!authorizationCode) {
            response.status(400).json({ error: "Authorization code is required" });
            return;
        }

        const oauthParams = new URLSearchParams({
            client_id: GITHUB.CLIENT_ID,
            client_secret: GITHUB.CLIENT_SECRET,
            code: authorizationCode,
        });

        const githubTokenEndpoint = `https://github.com/login/oauth/access_token?${oauthParams}`;
        const githubResponse = await fetch(githubTokenEndpoint, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        });

        if (!githubResponse.ok) {
            throw new Error(
                `GitHub API responded with status: ${githubResponse.status}`
            );
        }

        const tokenData: GitHubTokenResponse =
            (await githubResponse.json()) as GitHubTokenResponse;
        response.json(tokenData);
    } catch (error) {
        next(error);
    }
}

async function getGithubUserData(
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authorizationHeader = request.get("Authorization");

        if (!authorizationHeader) {
            response.status(401).json({ error: "Authorization header is required" });
            return;
        }

        const githubApiResponse = await fetch("https://api.github.com/user", {
            method: "GET",
            headers: {
                Authorization: authorizationHeader,
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!githubApiResponse.ok) {
            throw new Error(
                `GitHub API responded with status: ${githubApiResponse.status}`
            );
        }

        const userData: GitHubUser = (await githubApiResponse.json()) as GitHubUser;
        response.json(userData);
    } catch (error) {
        next(error);
    }
}
export { getGithubAccessToken, getGithubUserData };
