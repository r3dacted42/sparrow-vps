import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(!!localStorage.getItem('accessToken'));

    function login() {
        isLoggedIn.value = true;
    }

    function logout() {
        isLoggedIn.value = false;
        localStorage.removeItem('accessToken');
    }

    return { isLoggedIn, login, logout };
});
