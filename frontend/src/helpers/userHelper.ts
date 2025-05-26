import { AUTH_SERVICE, getUserData } from "./loginHelpers";

export async function updateUser(username: string, updateData: Record<string, any>) {
    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/users/${username}`;
        const response = await fetch(serverEndPointUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
        });
        const result = await response.json();
        console.log(result);
        return response.ok;
    } catch (error) {
        console.error("Error updating user:", error);
        return false;
    }
}

export async function createUser(userData: any): Promise<boolean> {
    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/users`;
        const response = await fetch(serverEndPointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return response.ok;
    } catch (error) {
        console.warn("Failed to create user: ", error);
        return false;
    }
}

export async function getUser(username: string) {
    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/users/${username}`;
        const response = await fetch(serverEndPointUrl, {
            method: "GET",
        });
        
        if (!response.ok) {
            return null;
        }
        
        const result = await response.json();
        return result.user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export async function addProject(url: string) {
    const userData = getUserData();
    if (!userData) {
        console.error("User not logged in");
        return;
    }

    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/projects/add`;
        const response = await fetch(serverEndPointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: userData.username,
                repolink: url,
            }),
        });
        const result = await response.json();
        console.log(result);
        
        if (response.ok) {
            await fetchProjects(userData.username);
        }
        
        return result;
    } catch (error) {
        console.error("Error adding project:", error);
        return { error: "Failed to add project" };
    }
}

export async function fetchProjects(username: string) {
    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/projects/fetch?user=${username}&table=projects`;
        const response = await fetch(serverEndPointUrl, {
            method: "GET",
        });
        const projectsList = await response.json();
        return projectsList;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

export async function deleteProject(params: any) {
    console.log('Delete projects functionality not implemented yet');
    // TODO: Implement when delete endpoint is added to backend
}

export async function fetchUserRepoData() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        console.error("No access token found");
        return [];
    }

    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/auth/github/user`;
        const response = await fetch(serverEndPointUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error("Error fetching user repo data:", error);
        return [];
    }
}

export async function updateUserSession(username: string) {
    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/users/${username}/session`;
        const response = await fetch(serverEndPointUrl, {
            method: "PUT",
        });
        const result = await response.json();
        return response.ok ? result : null;
    } catch (error) {
        console.error("Error updating user session:", error);
        return null;
    }
}

export async function getUserSession(username: string) {
    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/users/${username}/session`;
        const response = await fetch(serverEndPointUrl, {
            method: "GET",
        });
        const result = await response.json();
        return response.ok ? result : null;
    } catch (error) {
        console.error("Error getting user session:", error);
        return null;
    }
}