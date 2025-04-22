const baseUrls = {
    repoService: "http://localhost:8000",
    containerService: "http://localhost:8001",
};

const serviceEndpoints = {
    repoService: {
        probe: (owner: string, repo: string) => {
            return baseUrls.repoService + `/probe/${owner}/${repo}`;
        },
        clone: (owner: string, repo: string) => {
            return baseUrls.repoService + `/clone/${owner}/${repo}`;
        },
    },
    containerService: {
        preview: () => {},
        build: () => {},
    }
};

export { baseUrls, serviceEndpoints };
