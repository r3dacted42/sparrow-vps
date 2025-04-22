<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import workflowConfig from '../data/workflowConfig';
import type { RepoData, WorkflowField } from '../types';

const props = defineProps({
    repoData: {
        type: Object as () => RepoData,
        required: true,
    },
});
const emit = defineEmits(['workflow-data']);

const selectedWorkflow = ref('');
const workflowFields = ref<WorkflowField[]>([]);

watch(
    () => props.repoData,
    (newData: RepoData) => {
        selectedWorkflow.value = newData.language;
        workflowFields.value = workflowConfig[newData.language] || [];
    },
    { immediate: true },
);

watch(
    () => selectedWorkflow.value,
    (newSelection: string) => {
        workflowFields.value = workflowConfig[newSelection] || [];
    },
    { immediate: true },
);

const isFormValid = computed(() => {
    if (workflowFields.value.length === 0) return true;
    return workflowFields.value.every((field) => !field.required || field.value);
});

const handleSubmit = () => {
    if (isFormValid.value) {
        const data = workflowFields.value.reduce((obj, field) => {
            obj[field.name] = field.value;
            return obj;
        }, {} as Record<string, string>);
        data['language'] = selectedWorkflow.value;
        emit('workflow-data', data);
    }
}
</script>

<template>
    <div>
        <form @submit.prevent="handleSubmit">
            <div>
                <label>Workflow</label>
                <select v-model="selectedWorkflow">
                    <option v-for="field in Object.keys(workflowConfig)" :value="field">{{ field }}</option>
                </select>
            </div>
            <div v-for="field in workflowFields" :key="field.name">
                <label :for="field.name">{{ field.label }}</label>
                <input v-if="field.type === 'text'" type="text" :id="field.name" v-model="field.value"
                    :placeholder="field.placeholder" />
                <select v-if="field.type === 'select'" :id="field.name" v-model="field.value">
                    <option v-for="option in field.options" :value="option.value">{{ option.label }}</option>
                </select>
            </div>
            <button type="submit" :disabled="!isFormValid">Proceed</button>
        </form>
    </div>
</template>
