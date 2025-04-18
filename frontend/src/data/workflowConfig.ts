import type { WorkflowField } from "../types";

const workflowConfig: Record<string, WorkflowField[]> = {
    'JavaScript': [
        {
            name: 'installCommand',
            label: 'Install Command',
            type: 'text',
            value: 'npm install',
            required: true,
            placeholder: 'e.g., npm install',
        },
        {
            name: 'buildCommand',
            label: 'Build Command',
            type: 'text',
            value: 'npm run build',
            required: true,
            placeholder: 'e.g., npm run build',
        },
        {
            name: 'outputDirectory',
            label: 'Build Output Directory',
            type: 'text',
            value: 'build',
            required: true,
            placeholder: 'e.g., build',
        },
        {
            name: 'deployCommand',
            label: 'Deploy Command',
            type: 'text',
            value: 'npm serve build',
            required: true,
            placeholder: 'e.g.-, npm serve build',
        },
        {
            name: 'environmentVars',
            label: 'Environment Variables',
            type: 'text',
            value: '',
            required: false,
            placeholder: 'e.g., TOKEN=...',
        },
    ],
    'Python': [
        {
            name: 'installCommand',
            label: 'Install Command',
            type: 'text',
            value: 'pip install -r requirements.txt',
            required: true,
            placeholder: 'e.g., pip install -r requirements.txt',
        },
        {
            name: 'outputDirectory',
            label: 'Application Directory',
            type: 'text',
            value: 'app',
            required: true,
            placeholder: 'e.g., app or .',
        },
        {
            name: 'runCommand',
            label: 'Run Command',
            type: 'text',
            value: 'cd app && python app.py',
            required: true,
            placeholder: 'e.g., python app.py',
        },
        {
            name: 'environmentVars',
            label: 'Environment Variables',
            type: 'text',
            value: '',
            required: false,
            placeholder: 'e.g., TOKEN=...',
        },
    ],
    // Add configurations for other languages here
};

export default workflowConfig;