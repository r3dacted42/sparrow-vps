export interface RepoData {
    owner: string;
    name: string;
    language: string;
}

export interface WorkflowField {
    name: string;
    label: string;
    type: 'text' | 'select';
    value: string;
    required: boolean,
    placeholder?: string;
    options?: { label: string; value: string }[];
}

export interface WorkflowStep {
    title: string;
    endpoint: CallableFunction;
}


// Database Entity Interfaces (matching backend)
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
    created_date: string;
}


// GitHub API Response Interfaces
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

// API Response Interfaces
export interface UserResponse {
    user: DatabaseUser;
}

export interface CreateUserResponse {
    message: string;
    user: DatabaseUser;
}

export interface ProjectResponse {
    message: string;
    data: DatabaseProject[];
}