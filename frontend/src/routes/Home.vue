<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import router from '../router';

const auth = useAuthStore();

onMounted(() => {
    if (!auth.checkAuthStatus()) {
        router.push('/login');
    }
});
</script>

<template>
    <div class="centered">
        <h4>Easily deploy your GitHub projects!</h4>
        <RouterLink to="/add-project" style="text-decoration: none;">
            <button class="add-button">
                Add Project
            </button>
        </RouterLink>
        <p>
            ...or view your <a>existing projects</a>.
        </p>
    </div>
</template>

<style scoped>
.centered {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-grow: 1;
}

.add-button {
    font-size: 24pt;
    font-weight: 500;
    margin-bottom: 10pt ;
}

a {
    cursor:pointer;
    text-decoration: none;
}
</style>