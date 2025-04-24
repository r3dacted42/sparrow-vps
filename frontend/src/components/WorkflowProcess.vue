<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import workflowSteps from '../data/workflowSteps';
import type { RepoData } from '../types';

const props = defineProps({
    repoData: {
        type: Object as () => RepoData,
        required: true,
    },
    workflowData: {
        type: Object as () => Record<string, string>,
        required: true,
    },
    dockerfile: {
        type: String,
        required: true,
    },
});

interface WorkflowStepData {
    title: string;
    endpoint: CallableFunction;
    result: string;
};

const stepKeys = ref<string[]>(Object.keys(workflowSteps));
const steps = ref<Record<string, WorkflowStepData>>(
    Object.keys(workflowSteps).reduce((obj, key) => {
        if (workflowSteps[key]) {
            obj[key] = {
                ...workflowSteps[key],
                result: "",
            };
        }
        return obj;
    }, {} as Record<string, WorkflowStepData>)
);
const currentStepIdx = ref(0);
const working = ref(true);

const indexedSteps = computed(() => {
    return stepKeys.value.map((k) => steps.value[k]).filter((s) => s);
});

watch(
    () => currentStepIdx.value,
    async (newIdx: number) => {
        const stepKey = stepKeys.value[newIdx];
        const stepEndpoint = steps.value[stepKey].endpoint;
        const newSteps = steps.value;
        try {
            let response;
            if (stepKey === 'clone') {
                response = await stepEndpoint(
                    props.repoData.owner, 
                    props.repoData.name,
                );
                if (response.data && response.status === 200) {
                    newSteps[stepKey].result = `return code: ${response.data.return_code}\n`
                        + `stdout: ${response.data.stdout}\n`
                        + `stderr: ${response.data.stderr}`;
                }
            }
            if (stepKey === 'build_image') {
                response = await stepEndpoint(
                    props.repoData.owner,
                    props.repoData.name,
                    props.workflowData.project_type,
                    props.dockerfile,
                );
                if (response.data && response.status === 200) {
                    newSteps[stepKey].result = `message: ${response.data.message}\n`
                        + `logs:\n${response.data.logs}`;
                }
            }
            if (!response) throw Error("response not defined");
            if (response.status !== 200 && response.status !== 201) {
                throw Error(`message: ${response.data.message}\n`
                    + `error: ${response.data.error}`);
            }
        } catch (err: any) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`failed at step ${steps.value[stepKey].title}:`, err);
            newSteps[stepKey].result = `failed at step: ${errorMessage}`;
            working.value = false;
        }
        steps.value = newSteps;
        if (working.value && newIdx < stepKeys.value.length - 1) {
            currentStepIdx.value = newIdx + 1;
        } else {
            working.value = false;
        }
    },
    { immediate: true },
)
</script>

<template>
    <div>
        <div v-for="(step, idx) in indexedSteps" :key="idx">
            <p>{{ step.title }}</p>
            <progress v-if="working && currentStepIdx === idx"></progress>
            <textarea v-if="step.result" v-model="step.result" 
                v-bind:rows="step.result.split('\n').length > 4 ? 10 : 3" readonly></textarea>
        </div>
    </div>
</template>
