<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { AUTH_SERVICE, generateRandomHexString, GH_CLIENT_ID, SPARROW_ORIGIN } from '../helpers/loginHelpers';
import { useAuthStore } from '../stores/auth';
import router from '../router';

const auth = useAuthStore();

watch(
  () => auth.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      router.push('/');
    }
  },
  { immediate: true },
);

onMounted(() => {
    const authURLString = window.location.search;
    const urlParams = new URLSearchParams(authURLString);
    const code = urlParams.get("code");
    const returnedState = urlParams.get("state");
    const storedState = localStorage.getItem("CSRFToken");
    
    if (code && storedState && returnedState) {
        localStorage.removeItem('CSRFToken');
        
        if (storedState !== returnedState) {
            console.warn("potential CSRF attack or invalid login attempt!!");
            auth.logout();
            return;
        }
        
        getAccessToken(code);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    // Check if user is already logged in
    if (localStorage.getItem("accessToken") && localStorage.getItem("userData")) {
        auth.login();
        router.push('/');
        return;
    }
});

async function getAccessToken(code: string) {
    try {
        // Step 1: Get access token from GitHub
        const tokenResponse = await fetch(`${AUTH_SERVICE}/auth/github/token?code=${code}`);
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
            console.error('Failed to get access token');
            return;
        }
        
        // Step 2: Get user data from GitHub
        const userResponse = await fetch(`${AUTH_SERVICE}/auth/github/user`, {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });
        const githubUser = await userResponse.json();
        
        if (!githubUser.login) {
            console.error('Failed to get user data');
            return;
        }
        
        // Step 3: Check if user exists in our database
        let userExists = false;
        try {
            const existingUserResponse = await fetch(`${AUTH_SERVICE}/users/${githubUser.login}`);
            userExists = existingUserResponse.ok;
        } catch (error) {
            console.log('User does not exist, will create new user');
        }
        
        // Step 4: Create or update user in database
        const userData = {
            github_id: githubUser.id,
            username: githubUser.login,
            name: githubUser.name || githubUser.login,
            email: githubUser.email,
            avatar_url: githubUser.avatar_url,
            html_url: githubUser.html_url,
            access_token: tokenData.access_token
        };
        
        if (!userExists) {
            // Create new user
            const createResponse = await fetch(`${AUTH_SERVICE}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!createResponse.ok) {
                console.error('Failed to create user');
                return;
            }
        } else {
            // Update existing user
            const updateResponse = await fetch(`${AUTH_SERVICE}/users/${githubUser.login}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    access_token: tokenData.access_token,
                    avatar_url: githubUser.avatar_url,
                    name: githubUser.name || githubUser.login,
                    email: githubUser.email
                })
            });
            
            if (!updateResponse.ok) {
                console.error('Failed to update user');
                return;
            }
        }
        
        // Step 5: Store data locally and login
        localStorage.setItem("accessToken", tokenData.access_token);
        localStorage.setItem("userData", JSON.stringify(userData));
        
        auth.login();
        router.push('/');
        
    } catch (error) {
        console.error('Login error:', error);
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
    margin-bottom: 8pt;

}
p {
    font-size: 0.85rem;
}
</style>