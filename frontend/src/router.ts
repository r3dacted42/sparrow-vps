import { createWebHistory, createRouter } from "vue-router";
import Home from "./routes/Home.vue";
import Login from "./routes/Login.vue";
import AddProject from "./routes/AddProject.vue";

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
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;