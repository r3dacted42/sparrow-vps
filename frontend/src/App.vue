<script setup lang="ts">
import { ref } from 'vue';
import Navbar from './components/Navbar.vue';
import RepoForm from './components/RepoForm.vue';
import WorkflowSelector from './components/WorkflowSelector.vue';
import WorkflowProcess from './components/WorkflowProcess.vue';
import type { RepoData } from './types';

const repoData = ref<RepoData>();
const workflowData = ref<Record<string, string>>();

const handleRepoData = (data: RepoData) => {
  repoData.value = data;
  console.log(data);
}
const handleWorkflowData = (data: Record<string, string>) => {
  workflowData.value = data;
  console.log(data);
}
</script>

<template>
  <Navbar />
  <RepoForm v-if="!workflowData" @repo-data="handleRepoData"/>
  <WorkflowSelector
    v-if="repoData && !workflowData"
    :repo-data="repoData"
    @workflow-data="handleWorkflowData"
  />
  <WorkflowProcess
    v-if="workflowData && repoData"
    :repo-data="repoData"
    :workflow-data="workflowData"
  />
</template>
