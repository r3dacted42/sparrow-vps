import { AUTH_SERVICE } from "./loginHelpers";

export async function updateUser(username: string, column: string, newVal: string) {
    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/updateUser`;
        const response = await fetch(serverEndPointUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                column: column,
                newValue: newVal,
            }),
        });
        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error("Error updating user:", error);
    }
}

export async function createUser(username: string, access_token: string): Promise<boolean> {
    try {
        const serverEndPointUrl = `${AUTH_SERVICE}/insert`;
        const response = await fetch(serverEndPointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                table_name: "users_superset",
                insert_object: {
                    username: username,
                    access_token: access_token,
                    modified_date: new Date(),
                },
            }),
        });
        return response.ok;
    } catch (error) {
        console.warn("Failed: ", error);
        return false;
    }
}

export async function addProject(url: string) {
    const serverEndPointUrl = `${AUTH_SERVICE}/addProject`;
    const response = await fetch(serverEndPointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user: userData.login,
            repolink: url,
        }),
    });
    console.log(await response.json());
    await fetchProjects(userData.login);
    return console.log("Invalid or Private Repository");
}

export async function fetchProjects(username: string) {
    const serverEndPointUrl = `${AUTH_SERVICE}/fetchRow?user=${username}&table=projects`;
    const response = await fetch(serverEndPointUrl, {
        method: "GET",
    });
    const projectsList = await response.json();
    return projectsList;
}

export async function deleteProject(params: any) {
    console.log('delete projects called');
}

export async function fetchUserRepoData() {
    const token = localStorage.getItem("accessToken");
    const serverEndPointUrl = `${AUTH_SERVICE}/fetchRepo`;
    const response = await fetch(serverEndPointUrl, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    const projects = await response.json();
    return projects;
}