export const GH_CLIENT_ID = import.meta.env.VITE_GH_CLIENT_ID;
export const SPARROW_ORIGIN = import.meta.env.VITE_SPARROW_ORIGIN;
export const AUTH_SERVICE = import.meta.env.VITE_AUTH_SERVICE;

export function checkLoggedIn(): boolean {
    return false;
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
    localStorage.removeItem("credentials");
    localStorage.removeItem("CSRFToken");
    window.history.replaceState({}, document.title, window.location.pathname);
}
