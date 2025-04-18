import type { WorkflowStep } from "../types";
import { serviceEndpoints } from "./serviceEndpoints";

const workflowSteps: Record<string, WorkflowStep> = {
    'clone': {
        title: "Cloning Repository",
        endpoint: serviceEndpoints.repoService.clone,
    },
    'installCommand': {
        title: "Installing Dependencies",
        endpoint: () => {},
    },
    'buildCommand': {
        title: "Running Build",
        endpoint: () => {},
    },
    'dockerImage': {
        title: "Building Docker Image",
        endpoint: () => {},
    },
};

export default workflowSteps;
