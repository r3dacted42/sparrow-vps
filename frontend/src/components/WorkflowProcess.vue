<script setup lang="ts">
import { ref, defineProps, watch, computed } from 'vue';
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
        try {
            if (stepKey === 'clone') {
                const response = await axios.post(stepEndpoint(props.repoData.owner, props.repoData.name));
                if (response.data && response.status === 200) {
                    const newSteps = steps.value;
                    newSteps[stepKey].result = `return code: ${response.data.return_code}\nstdout: ${response.data.stdout}\nstderr: ${response.data.stderr}`;
                    steps.value = newSteps;
                }
            }
        } catch (err: any) {
            console.error(`failed at step ${steps.value[stepKey].title}:`, err);
        }
        if (newIdx < stepKeys.value.length - 1) {
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
