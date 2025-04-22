import type { WorkflowStep } from "../types";
import { serviceEndpoints } from "./serviceEndpoints";

const workflowSteps: Record<string, WorkflowStep> = {
    'clone': {
        title: "Cloning Repository",
        endpoint: serviceEndpoints.repoService.clone,
    },
    'install_command': {
        title: "Installing Dependencies",
        endpoint: () => {},
    },
    'build_command': {
        title: "Running Build",
        endpoint: () => {},
    },
    'build_image': {
        title: "Building Docker Image",
        endpoint: () => {},
    },
};

export default workflowSteps;
