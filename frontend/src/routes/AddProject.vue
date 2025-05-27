<script setup lang="ts">
import { ref, watch } from 'vue';
import RepoForm from '../components/RepoForm.vue';
import WorkflowSelector from '../components/WorkflowSelector.vue';
import BuildProcess from '../components/BuildProcess.vue';
import type { RepoData } from '../types';
import PreviewDockerfile from '../components/PreviewDockerfile.vue';
import router from '../router';
import { useAuthStore } from '../stores/auth';
import DeployProcess from '../components/DeployProcess.vue';
import { addProject } from '../helpers/userHelper';

const auth = useAuthStore();

watch(
  () => auth.isLoggedIn,
  (isLoggedIn) => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  },
  { immediate: true },
);

const repoData = ref<RepoData>();
const workflowData = ref<Record<string, string>>();
const dockerfile = ref<string>("");
const imageTag = ref<string>("");
const projUrl = ref<string>("");

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
const handleImageTagData = (data: string, cancel?: boolean) => {
  if (cancel) {
    dockerfile.value = "";
    return;
  }
  imageTag.value = data;
  console.log(data);
}
const handleProjectUrl = (data: string) => {
  projUrl.value = data;
  if (!repoData.value) throw Error("repo data not available, cannot save project!");
  addProject(repoData.value.repoUrl, data);
}
</script>

<template>
  <RepoForm v-if="!dockerfile" @repo-data="handleRepoData" />
  <WorkflowSelector v-if="repoData && !dockerfile" :repo-data="repoData" @workflow-data="handleWorkflowData" />
  <PreviewDockerfile v-if="repoData && workflowData && !dockerfile" :workflow-data="workflowData"
    @dockerfile="handleDockerfileData" />
  <BuildProcess v-if="dockerfile && workflowData && repoData && !imageTag" :repo-data="repoData" :workflow-data="workflowData"
    :dockerfile="dockerfile" @image-tag="handleImageTagData" />
  <DeployProcess v-if="imageTag" :image-tag="imageTag" @pathname="handleProjectUrl" />
</template>
