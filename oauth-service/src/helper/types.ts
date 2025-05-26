// Environment Configuration Interfaces
export interface GithubEnv {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
}

export interface SupaBaseEnv {
    SUPABASE_DB_URL: string;
    SUPABASE_API_KEY: string;
}

// External API Response Interfaces
export interface GitHubTokenResponse {
    access_token: string;
    token_type: string; 
    scope: string;
}

export interface GitHubUser {
    id: number;
    login: string;
    name: string;
    email: string | null;
    avatar_url: string;
    html_url: string;
}

// Database Entity Interfaces
export interface DatabaseUser {
    github_id: number;
    username: string;
    name: string;
    email: string | null;
    avatar_url: string;
    html_url: string;
    access_token: string;
    modified_date: string;
    created_date: string;
}

export interface DatabaseProject {
    id?: number;
    user: string;
    repourl: string;
    created_at: string;
}

// API Request Interfaces
export interface AddProjectRequest {
    user: string;
    repolink: string;
}

export interface FetchProjectsQuery extends Record<string, string | undefined> {
    user: string;
    table: string;
}

// API Response Interfaces
export interface HttpError extends Error {
    statusCode?: number;
}

export interface UserResponse {
    user: DatabaseUser;
}

export interface CreateUserResponse {
    message: string;
    user: DatabaseUser;
}

export interface UpdateUserResponse {
    message: string;
    user: DatabaseUser;
}

export interface ProjectResponse {
    message: string;
    data: DatabaseProject[];
}

export interface FetchProjectsResponse {
    projects: DatabaseProject[];
}

export interface SessionResponse {
    expired: boolean;
    sessionDuration: number;
    sessionLimit: number;
    sessionStart: string;
}

export interface SessionUpdateResponse {
    message: string;
    sessionStart: string;
}