<script setup lang="ts">
import { checkLoggedIn } from '../helpers/loginHelpers';
import router from '../router';

if (!checkLoggedIn()) {
    router.push('/login');
}
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
}
</style>