export const GH_CLIENT_ID = import.meta.env.VITE_GH_CLIENT_ID;
export const SPARROW_ORIGIN = import.meta.env.VITE_SPARROW_ORIGIN;
export const AUTH_SERVICE = import.meta.env.VITE_AUTH_SERVICE;

export function checkLoggedIn(): boolean {
    const hasToken = !!localStorage.getItem('accessToken');
    const hasUserData = !!localStorage.getItem('userData');
    return hasToken && hasUserData;
}

export function generateRandomHexString(length: number) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array,
        (byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

export function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("credentials");
    localStorage.removeItem("CSRFToken");
    window.history.replaceState({}, document.title, window.location.pathname);
}

export function getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
}

export function getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
}