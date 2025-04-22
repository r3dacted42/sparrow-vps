import type { WorkflowField } from "../types";

const workflowConfig: Record<string, WorkflowField[]> = {
    'JavaScript': [
        {
            name: 'node_version',
            label: 'NodeJS Version',
            type: 'select',
            value: '20',
            required: true,
            placeholder: 'NodeJS Version',
            options: [
                { value: '18', label: '18' },
                { value: '20', label: '20' },
                { value: '23', label: '23' },
            ],
        },
        {
            name: 'install_command',
            label: 'Install Command',
            type: 'text',
            value: 'npm install',
            required: true,
            placeholder: 'e.g., npm install',
        },
        {
            name: 'build_command',
            label: 'Build Command',
            type: 'text',
            value: 'npm run build',
            required: true,
            placeholder: 'e.g., npm run build',
        },
        {
            name: 'output_directory',
            label: 'Build Output Directory',
            type: 'text',
            value: 'build',
            required: true,
            placeholder: 'e.g., build',
        },
        {
            name: 'environment_vars',
            label: 'Environment Variables',
            type: 'text',
            value: '',
            required: false,
            placeholder: 'e.g., VAR1="value1" VAR2="value2"',
        },
    ],
    'Python': [
        {
            name: 'install_command',
            label: 'Install Command',
            type: 'text',
            value: 'pip install -r requirements.txt',
            required: true,
            placeholder: 'e.g., pip install -r requirements.txt',
        },
        {
            name: 'expose_port',
            label: 'Expose Port',
            type: 'text',
            value: '8000',
            required: true,
            placeholder: 'e.g., 8000',
        },
        {
            name: 'deploy_command',
            label: 'Deploy Command',
            type: 'text',
            value: 'python app.py',
            required: true,
            placeholder: 'e.g., python app.py',
        },
        {
            name: 'environment_vars',
            label: 'Environment Variables',
            type: 'text',
            value: '',
            required: false,
            placeholder: 'e.g., VAR1="value1" VAR2="value2"',
        },
    ],
    // Add configurations for other languages here
};

export default workflowConfig;