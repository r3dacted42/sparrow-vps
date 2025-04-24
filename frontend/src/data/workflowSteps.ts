import type { WorkflowStep } from "../types";
import { serviceEndpoints } from "./serviceEndpoints";

const workflowSteps: Record<string, WorkflowStep> = {
    'clone': {
        title: "Cloning Repository",
        endpoint: serviceEndpoints.repoService.clone,
    },
    'build_image': {
        title: "Building Docker Image",
        endpoint: serviceEndpoints.containerService.build,
    },
};

export default workflowSteps;
