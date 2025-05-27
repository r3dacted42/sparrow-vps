import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(true);// ref(!!localStorage.getItem('accessToken'));

    const userData = computed(() => {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    });

    function login() {
        isLoggedIn.value = true;
    }

    function logout() {
        isLoggedIn.value = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('credentials');
        localStorage.removeItem('CSRFToken');
    }

    function checkAuthStatus() {
        const hasToken = !!localStorage.getItem('accessToken');
        const hasUserData = !!localStorage.getItem('userData');
        isLoggedIn.value = hasToken && hasUserData;
        return isLoggedIn.value;
    }

    return { 
        isLoggedIn, 
        userData, 
        login, 
        logout, 
        checkAuthStatus 
    };
});