<script setup lang="ts">
import { ref } from 'vue';
import Navbar from './components/Navbar.vue';
import RepoForm from './components/RepoForm.vue';
import WorkflowSelector from './components/WorkflowSelector.vue';
import WorkflowProcess from './components/WorkflowProcess.vue';
import type { RepoData } from './types';
import PreviewDockerfile from './components/PreviewDockerfile.vue';

const repoData = ref<RepoData>();
const workflowData = ref<Record<string, string>>();
const dockerfile = ref<string>("");

const handleRepoData = (data: RepoData) => {
  repoData.value = data;
  console.log(data);
}
const handleWorkflowData = (data: Record<string, string>) => {
  workflowData.value = data;
  console.log(data);
}
const handleDockerfileData = (data: string, cancel?: boolean) => {
  if (cancel) {
    workflowData.value = undefined;
    return;
  }
  dockerfile.value = data;
  console.log(data);
}
</script>

<template>
  <Navbar />
  <RepoForm v-if="!dockerfile" @repo-data="handleRepoData" />
  <WorkflowSelector
    v-if="repoData && !dockerfile"
    :repo-data="repoData"
    @workflow-data="handleWorkflowData"
  />
  <PreviewDockerfile
    v-if="repoData && workflowData && !dockerfile"
    :workflow-data="workflowData"
    @dockerfile="handleDockerfileData"
  />
  <WorkflowProcess
    v-if="dockerfile && workflowData && repoData"
    :repo-data="repoData"
    :workflow-data="workflowData"
    :dockerfile="dockerfile"
  />
</template>
