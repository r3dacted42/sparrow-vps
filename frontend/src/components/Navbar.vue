<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { handleLogout } from '../helpers/loginHelpers';
import router from '../router';

const auth = useAuthStore();

const userData = computed(() => {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
});

function logout() {
    handleLogout();
    auth.logout();
    router.push('/login');
}
</script>

<template>
    <nav>
        <ul>
            <li>
                <RouterLink to="/" style="text-decoration: none;">
                    <hgroup>
                        <h2>SparrowVPS</h2>
                        <p>Cloud deployments made easy</p>
                    </hgroup>
                </RouterLink>
            </li>
        </ul>
        <ul v-if="auth.isLoggedIn && userData">
            <li>
                <RouterLink to="/add-project">Add Project</RouterLink>
            </li>
            <li>
                <a :href="userData.html_url" target="_blank" rel="noopener noreferrer" 
                   style="display: flex; align-items: center; text-decoration: none;">
                    <img :src="userData.avatar_url" 
                         :alt="userData.username + ' avatar'"
                         style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px;" />
                    <span style="color: azure;">{{ userData.username }}</span>
                </a>
            </li>
            <li>
                <button class="outline secondary" @click="logout" title="Logout">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
            </li>
        </ul>
    </nav>
    <hr />
</template>

<style scoped></style>