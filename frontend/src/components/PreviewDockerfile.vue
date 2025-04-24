<script setup lang="ts">
import { ref, watch } from 'vue';
import { serviceEndpoints } from '../data/serviceEndpoints';
import Editor from './Editor.vue';

const props = defineProps({
    workflowData: {
        type: Object as () => Record<string, string>,
        required: true,
    },
});
const emit = defineEmits(['dockerfile']);

const dockerfile = ref('');
const errMsg = ref('');

watch(
    () => props.workflowData,
    async (newData: Record<string, string>) => {
        try {
            const response = await serviceEndpoints.containerService.preview(
                newData.project_type,
                newData.install_command,
                newData.environment_vars,
                newData.node_version,
                newData.build_command,
                newData.output_directory,
                newData.expose_port,
                newData.deploy_command,
            );
            if (!response) throw Error("response not defined");
            if (response.status === 200) {
                dockerfile.value = response.data;
            } else {
                errMsg.value = `${response.data.message}: ${String(response.data.error)}`;
            }
        } catch (err: any) {
            console.error("failed while fetching dockerfile preview:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            errMsg.value = errorMessage;
        }
    },
    { immediate: true },
);

function handleChange(newDockerfile: string) {
    dockerfile.value = newDockerfile;
}

function handleConfirm() {
    emit('dockerfile', dockerfile.value);
}

function handleCancel() {
    emit('dockerfile', "", true);
}
</script>

<template>
    <dialog open>
        <article>
            <header>
                Dockerfile Preview
            </header>
            <Editor 
                :dockerfile="dockerfile"
                @change="handleChange"
            />
            <textarea v-model="errMsg" v-if="errMsg" readonly></textarea>
            <span v-if="!dockerfile && !errMsg" aria-busy="true">Fetching preview...</span>
            <footer>
                <button v-if="!errMsg" v-on:click="handleConfirm">Confirm</button>
                <button v-on:click="handleCancel">{{ errMsg ? "Retry" : "Cancel" }}</button>
            </footer>
        </article>
    </dialog>
</template>