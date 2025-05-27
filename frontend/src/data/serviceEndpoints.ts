import axios from "axios";

const baseUrls = {
    repoService:
        import.meta.env.VITE_REPO_SERVICE
        ?? "http://sparrow-vps.local:30080",
    containerService:
        import.meta.env.VITE_CONT_SERVICE
        ?? "http://sparrow-vps.local:30081",
    deployService:
        import.meta.env.VITE_DPLY_SERVICE
        ?? "http://sparrow-vps.local:30082",
    authService:
        import.meta.env.VITE_AUTH_SERVICE
        ?? "http://sparrow-vps.local:30083",
};

const api = axios.create({
    timeout: 120000,
});

const serviceEndpoints = {
    repoService: {
        probe: (owner: string, repo: string) => {
            return api.get(baseUrls.repoService + `/probe/${owner}/${repo}`);
        },
        clone: (owner: string, repo: string) => {
            return api.post(baseUrls.repoService + `/clone/${owner}/${repo}`);
        },
    },
    containerService: {
        preview: (
            projectType: string,
            installCommand: string,
            environmentVars: string,
            nodeVersion?: string,
            buildCommand?: string,
            outputDirectory?: string,
            exposePort?: string,
            deployCommand?: string,
        ) => {
            return api.get(baseUrls.containerService + '/preview'
                + `?project_type=${projectType}`
                + `&install_command=${installCommand}`
                + `&environment_vars=${environmentVars}`
                + (nodeVersion ? `&node_version=${nodeVersion}` : '')
                + (buildCommand ? `&build_command=${buildCommand}` : '')
                + (outputDirectory ? `&output_directory=${outputDirectory}` : '')
                + (exposePort ? `&expose_port=${exposePort}` : '')
                + (deployCommand ? `&deploy_command=${deployCommand}` : ''));
        },
        build: (
            repoOwner: string,
            repoName: string,
            projectType: string,
            dockerfile: string,
        ) => {
            return api.post(baseUrls.containerService + '/build',
                {
                    repo_owner: repoOwner,
                    repo_name: repoName,
                    project_type: projectType,
                    dockerfile: dockerfile,
                },
            );
        },
        push: (
            imageTag: string,
        ) => {
            return api.post(baseUrls.containerService + '/push',
                {
                    image_tag: imageTag,
                },
            );
        },
    },
    deployService: {
        deploy: (
            imageTag: string,
            pathName: string,
            exposePort: string,
        ) => {
            return api.post(baseUrls.deployService + '/deploy',
                {
                    image_tag: imageTag,
                    path_name: pathName,
                    expose_port: exposePort,
                },
            );
        },
    },
};

export { baseUrls, serviceEndpoints };
