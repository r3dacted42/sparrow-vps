<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-python';
import 'prismjs/plugins/autolinker/prism-autolinker';

const props = defineProps({
    dockerfile: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['change']);

const code = ref('');
const highlightedCode = ref('');
const editor = ref<HTMLTextAreaElement | null>(null);

watch(
    () => props.dockerfile,
    (newDockerfile: string) => {
        code.value = newDockerfile;
        highlightedCode.value = Prism.highlight(code.value, Prism.languages.docker, 'docker');
    },
    { immediate: true },
);

function highlightCode() {
    if (editor.value) {
        emit('change', code.value);
        highlightedCode.value = Prism.highlight(code.value, Prism.languages.docker, 'docker');
    }
}

onMounted(() => {
    highlightCode();
    if (editor.value) {
        editor.value.addEventListener('scroll', () => {
            const pre = document.querySelector('pre');
            if (pre) {
                pre.scrollTop = editor.value!.scrollTop;
                pre.scrollLeft = editor.value!.scrollLeft;
            }
        });
    }
});
</script>

<template>
    <div class="code-editor-container">
        <textarea 
            ref="editor" 
            v-model="code" 
            class="code-editor" 
            @input="highlightCode"
            spellcheck="false"
        ></textarea>
        <pre v-html="highlightedCode"></pre>
    </div>
</template>

<style scoped>
.code-editor-container {
    position: relative;
    height: 450px;
}

.code-editor {
    font-family: monospace;
    font-size: var(--pico-font-size);
    padding: 8px;
    margin: 0;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    resize: none;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    background-color: transparent;
    color: transparent;
    caret-color: var(--pico-color);
    z-index: 1;
    line-height: var(--pico-line-height);
    outline: 0px;
}

pre {
    font-family: monospace;
    font-size: var(--pico-font-size);
    padding: 8px;
    margin: 0;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    pointer-events: none;
    line-height: var(--pico-line-height);
    text-underline-offset: var(--pico-text-underline-offset);
    outline: 0px;
    border: 1px solid transparent;
}
</style>