<script setup lang="ts">
import { computed, ref } from 'vue';
import { serviceEndpoints } from '../data/serviceEndpoints';

const props = defineProps({
    imageTag: {
        type: String,
        required: true,
    },
});

const pathName = ref("");
const exposePort = ref("");
const isSubmitting = ref(false);
const deployUrl = ref("");

const isFormValid = computed(() => !!pathName && !!exposePort);
function filterPathName() { 
    pathName.value = pathName.value.replace(/[^a-zA-Z-]/g, '').toLowerCase();
}

async function handleSubmit() {
    isSubmitting.value = true;
    try {
        const response = await serviceEndpoints.deployService.deploy(
            props.imageTag, pathName.value, exposePort.value,
        );
        if (response.data && response.status === 200) {
            deployUrl.value = response.data.project_url;
        }
    } catch (err: any) {
        //
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div v-if="!deployUrl">
        <h2>Deployment Configuration</h2>
        <div>
            <label>Path Name</label>
            <input v-model="pathName" @input="filterPathName"/>
        </div>
        <div>
            <label>Expose Port</label>
            <input v-model="exposePort" type="number" min="8005" max="32765" />
        </div>
        <button :disabled="!isFormValid || isSubmitting" :aria-busy="isSubmitting" type="submit"
        v-on:click="handleSubmit">Deploy</button>
    </div>
    <div v-if="deployUrl">
        <h1>Project Deployed Successfully!</h1>
        <a :href="deployUrl" target="_blank">{{ deployUrl }}</a>
    </div>
</template>
