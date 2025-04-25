import axios from "axios";

const baseUrls = {
    repoService: "http://sparrow-vps.local:30080",
    containerService: "http://sparrow-vps.local:30081",
};

const serviceEndpoints = {
    repoService: {
        probe: (owner: string, repo: string) => {
            return axios.get(baseUrls.repoService + `/probe/${owner}/${repo}`);
        },
        clone: (owner: string, repo: string) => {
            return axios.post(baseUrls.repoService + `/clone/${owner}/${repo}`);
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
            return axios.get(baseUrls.containerService + '/preview'
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
            return axios.post(baseUrls.containerService + '/build',
                {
                    repo_owner: repoOwner,
                    repo_name: repoName,
                    project_type: projectType,
                    dockerfile: dockerfile,
                },
            );
        },
    }
};

export { baseUrls, serviceEndpoints };
