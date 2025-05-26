<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { fetchProjects } from '../helpers/userHelper';
import { getUserData } from '../helpers/loginHelpers';
import type { DatabaseProject } from '../types';
import router from '../router';

const auth = useAuthStore();
const projects = ref<DatabaseProject[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
    // Check if user is authenticated
    if (!auth.checkAuthStatus()) {
        router.push('/login');
        return;
    }

    await loadProjects();
});

async function loadProjects() {
    try {
        loading.value = true;
        error.value = null;
        
        const userData = getUserData();
        if (!userData) {
            error.value = 'User data not found';
            return;
        }

        const projectsList = await fetchProjects(userData.username);
        projects.value = projectsList || [];
    } catch (err) {
        console.error('Error loading projects:', err);
        error.value = 'Failed to load projects';
    } finally {
        loading.value = false;
    }
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getRepoName(repoUrl: string) {
    // Extract repository name from URL
    const parts = repoUrl.split('/');
    return parts[parts.length - 1] || repoUrl;
}

function openRepo(repoUrl: string) {
    window.open(repoUrl, '_blank', 'noopener,noreferrer');
}

async function refreshProjects() {
    await loadProjects();
}
</script>

<template>
    <div class="container">
        <div class="header">
            <h2>Your Projects</h2>
            <button class="outline" @click="refreshProjects" :disabled="loading">
                <i class="fa-solid fa-refresh" :class="{ 'fa-spin': loading }"></i>
                Refresh
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="centered">
            <div class="loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Loading your projects...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="centered">
            <div class="error">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>{{ error }}</p>
                <button @click="refreshProjects">Try Again</button>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="projects.length === 0" class="centered">
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <h3>No projects deployed yet</h3>
                <p>Start by adding your first GitHub repository to deploy.</p>
                <RouterLink to="/add-project" style="text-decoration: none;">
                    <button class="add-button">
                        <i class="fa-solid fa-plus"></i>
                        Add Project
                    </button>
                </RouterLink>
            </div>
        </div>

        <!-- Projects List -->
        <div v-else class="projects-grid">
            <div 
                v-for="project in projects" 
                :key="project.id" 
                class="project-card"
            >
                <div class="project-header">
                    <div class="project-info">
                        <h4 class="project-name">
                            <i class="fa-brands fa-github"></i> 
                            <span>{{ getRepoName(project.repourl) }}</span>
                        </h4>
                        <p class="project-url">{{ project.repourl }}</p>
                    </div>
                    <div class="project-actions">
                        <button 
                            class="outline secondary" 
                            @click="openRepo(project.repourl)"
                            title="View on GitHub"
                        >
                            <i class="fa-solid fa-external-link"></i>
                        </button>
                    </div>
                </div>
                
                <div class="project-meta">
                    <small>
                        <i class="fa-solid fa-calendar"></i>
                        Added: {{ formatDate(project.created_at) }}
                    </small>
                </div>

                <div class="project-status">
                    <span class="status-badge deployed">
                        <i class="fa-solid fa-check-circle"></i>
                        Deployed
                    </span>
                </div>
            </div>
        </div>

        <!-- Add Project Button -->
        <div v-if="projects.length > 0" class="add-project-section">
            <RouterLink to="/add-project" style="text-decoration: none;">
                <button class="outline">
                    <i class="fa-solid fa-plus"></i>
                    Add Another Project
                </button>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.header h2 {
    margin: 0;
    color: var(--primary);
}

.centered {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

.loading, .error, .empty-state {
    text-align: center;
    padding: 2rem;
}

.loading i, .error i, .empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--muted-color);
}

.error i {
    color: var(--del-color);
}

.empty-state {
    max-width: 400px;
}

.empty-state h3 {
    margin: 1rem 0;
    color: var(--color);
}

.empty-state p {
    color: var(--muted-color);
    margin-bottom: 2rem;
}

.add-button {
    font-size: 1.1rem;
    font-weight: 500;
}

.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.project-card {
    position: relative;
    border-radius: 8px;
    padding: 1.2rem ;
    background: var(--card-background-color);
    border: 1px solid #f1f1f133;
    transition: border 0.2s ease;
}
.project-card:hover {
    border: 1px solid #f1f1f155;
}

.project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.project-info {
    flex: 1;
    min-width: 0;
}

.project-name {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.project-name i {
    color: var(--muted-color);
}

.project-url {
    margin: 0;
    font-size: 0.7rem;
    color: var(--muted-color);
    word-break: break-all;
}

.project-actions {
    margin-left: 1rem;
}

.project-actions button {
    padding: 0.5rem;
    margin: 0;
}

.project-meta {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    font-size: 0.8rem;
    border-bottom: 1px solid var(--muted-border-color);
}

.project-meta small {
    color: var(--muted-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.project-status {
    position: absolute;
    bottom: 10pt;
    right: 10pt;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.status-badge.deployed {
    background-color: rgba(46, 160, 67, 0.1);
    color: #2ea043;
    border: 1px solid rgba(46, 160, 67, 0.2);
}

.add-project-section {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--muted-border-color);
}

.fa-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .projects-grid {
        grid-template-columns: 1fr;
    }
    
    .project-header {
        flex-direction: column;
        gap: 1rem;
    }
    
    .project-actions {
        margin-left: 0;
        align-self: flex-end;
    }
}
</style>