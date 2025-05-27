<script setup lang="ts">
import { computed, ref } from 'vue';
import { serviceEndpoints } from '../data/serviceEndpoints';
import { addProject } from '../helpers/userHelper';

const emit = defineEmits(['repo-data']);

const repoUrl = ref('');
const urlData = ref({
    owner: '',
    repo: '',
});
const isSubmitting = ref(false);
const result = ref('');

const validateRepoUrl = computed(() => {
    if (!repoUrl.value || repoUrl.value === '') {
        urlData.value = { owner: '', repo: '' };
        return true;
    }
    let valid = false;
    try {
        const url = new URL(repoUrl.value);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if ((url.protocol !== 'https:' && url.protocol !== 'http:')
            || url.hostname !== 'github.com'
            || pathSegments.length < 2) {
            valid = false;
        } else {
            valid = true;
            urlData.value = {
                owner: pathSegments[0],
                repo: pathSegments[1].endsWith(".git")
                    ? pathSegments[1].replace(".git", "")
                    : pathSegments[1],
            };
        }
    } catch (_err) {
        valid = false;
    }
    if (!valid) urlData.value = { owner: '', repo: '' };
    return valid;
});

const urlInputAriaInvalid = computed(() => {
    return repoUrl.value === '' ? undefined : !validateRepoUrl.value;
});

const isFormValid = computed(() => {
    return repoUrl.value !== '' && validateRepoUrl.value;
});

const handleSubmit = async () => {
    if (!isFormValid.value) return;

    const userData = getUserData();
    if (!userData) {
        result.value = "Please log in to add projects";
        return;
    }
    
    isSubmitting.value = true;
    try {
        const owner = urlData.value.owner, repo = urlData.value.repo;
        
        // Verify the repository
        const response = await serviceEndpoints.repoService.probe(owner, repo);
        if (response.data && response.status === 200) {
            const language = response.data.language;
            
            //Save the project to database
            const saveResult = await addProject(repoUrl.value);
            
            if (saveResult && !saveResult.error) {
                result.value = "project added successfully!";
                emit("repo-data", {
                    language: language,
                    owner: urlData.value.owner,
                    name: urlData.value.repo,
                });
            } else {
                // failed to save
                result.value = saveResult?.message || "failed to save project.";
            }
        } else {
            result.value = response.data.message;
        }
    } catch (err: any) {
        console.error("error verifying repo:", err);
        result.value = err.response?.data.message
            ?? "Error while verifying, please try again";
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <form v-if="!result" @submit.prevent="handleSubmit">
        <fieldset role="group">
            <input type="url" id="gh-url" placeholder="Github URL" v-model.trim="repoUrl"
                :aria-invalid="urlInputAriaInvalid" />
            <button type="submit" :disabled="!isFormValid" :aria-busy="isSubmitting">
                {{ isSubmitting ? "Verifying..." : "Verify" }}
            </button>
        </fieldset>
        <small v-if="urlInputAriaInvalid">Please enter a valid Github Repo URL (http/https)</small>
    </form>
    <p v-if="result">{{ result }}</p>
</template>