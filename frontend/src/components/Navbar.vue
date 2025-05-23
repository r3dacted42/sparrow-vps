<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
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
        <ul v-if="auth.isLoggedIn">
            <li>
                <RouterLink to="/add-project">Add Project</RouterLink>
            </li>
            <li>
                <button class="outline secondary"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
            </li>
        </ul>
    </nav>
    <hr />
</template>

<style scoped></style>