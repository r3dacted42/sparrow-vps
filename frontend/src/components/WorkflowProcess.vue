<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import workflowSteps from '../data/workflowSteps';
import type { RepoData } from '../types';
import axios from 'axios';

const props = defineProps({
    repoData: {
        type: Object as () => RepoData,
        required: true,
    },
    workflowData: {
        type: Object as () => Record<string, string>,
        required: true,
    },
});

interface WorkflowStepData {
    title: string;
    endpoint: CallableFunction;
    result: string;
};

const stepKeys = ref<string[]>([]);
const steps = ref<Record<string, WorkflowStepData>>({});
const currentStepIdx = ref(0);
const working = ref(true);

watch(
    () => props.workflowData,
    (newData: Record<string, string>) => {
        const keys = [
            "clone",
            ...Object.keys(newData),
            "dockerImage",
        ];
        stepKeys.value = keys;
        steps.value = keys.reduce((obj, key) => {
            if (workflowSteps[key]) {
                obj[key] = {
                    ...workflowSteps[key],
                    result: "",
                };
            }
            return obj;
        }, {} as Record<string, WorkflowStepData>);
    },
    { immediate: true },
);

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
                response = await axios.post(stepEndpoint(props.repoData.owner, props.repoData.name));
                if (response.data && response.status === 200) {
                    newSteps[stepKey].result = `return code: ${response.data.return_code}\nstdout: ${response.data.stdout}\nstderr: ${response.data.stderr}`;
                }
            }
            if (!response) throw Error("response not defined");
            if (response.status !== 200 && response.status !== 201) {
                newSteps[stepKey].result = `server responded: ${response.data.message}`;
                working.value = false;
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
        }
    },
    { immediate: true },
)
</script>

<template>
    <div>
        <div v-for="(step, idx) in indexedSteps" :key="idx">
            <p>{{ step.title }}</p>
            <progress v-if="currentStepIdx === idx" />
            <textarea v-if="step.result" readonly>
{{ step.result }}</textarea>
        </div>
    </div>
</template>
