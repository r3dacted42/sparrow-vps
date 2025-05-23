<script setup lang="ts">
import { onMounted } from 'vue';
import { AUTH_SERVICE, generateRandomHexString, GH_CLIENT_ID, SPARROW_ORIGIN } from '../helpers/loginHelpers';
import { useAuthStore } from '../stores/auth';
import router from '../router';

const auth = useAuthStore();

onMounted(() => {
    const authURLString = window.location.search;
    const urlParams = new URLSearchParams(authURLString);
    const code = urlParams.get("code");
    const returnedState = urlParams.get("state");
    const storedState = localStorage.getItem("CSRFToken");
    localStorage.removeItem('CSRFToken');

    console.log(returnedState);
    console.log(storedState);

    if (storedState !== returnedState) {
        console.warn("potential CSRF attack or invalid login attempt!!");
        auth.logout();
        return;
    }

    if (localStorage.getItem("accessToken")) {
        auth.login();
        router.push('/');
        return;
    }
    if (!code) {
        return;
    }
    getAccessToken(code);
    window.history.replaceState({}, document.title, window.location.pathname);
})

async function getAccessToken(code: string) {
    const accessTokenEndPoint = `${AUTH_SERVICE}/getAccessToken?code=${code}`;
    const response = await fetch(accessTokenEndPoint);
    const data = await response.json();
    if (data.access_token) {
        localStorage.setItem("accessToken", data.access_token);
        auth.login();
        router.push('/');
    }
}

function logInWithGithub() {
    const state = generateRandomHexString(16);
    localStorage.setItem("CSRFToken", state);
    const params = new URLSearchParams({
        client_id: GH_CLIENT_ID,
        redirect_uri: `${SPARROW_ORIGIN}/login`,
        scope: "repo,user",
        state: state,
    });
    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    window.location.assign(authUrl);
}
</script>

<template>
    <div class="centered">
        <h4>Easily deploy your GitHub projects!</h4>
        <button class="gh-button" v-on:click="logInWithGithub">
            <i class="fa-brands fa-github-alt"></i> Login with GitHub
        </button>
        <p></p>
        <p>GitHub login will only be used to access repository code for deployment.</p>
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

.gh-button {
    font-size: 24pt;
    font-weight: 500;
}
</style>