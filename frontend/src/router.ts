import { createWebHistory, createRouter } from "vue-router";
import Home from "./routes/Home.vue";
import Login from "./routes/Login.vue";
import AddProject from "./routes/AddProject.vue";
import Projects from "./routes/Projects.vue";

const routes = [
    { 
        path: '/', 
        component: Home,
    },
    {
        path: '/login',
        component: Login,
    },
    { 
        path: '/add-project', 
        component: AddProject,
    },
    {
        path: '/projects',
        component: Projects,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;