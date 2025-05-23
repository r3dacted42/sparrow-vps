export interface RepoData {
    owner: string;
    name: string;
    language: string;
}

export interface WorkflowField {
    name: string;
    label: string;
    type: 'text' | 'select';
    value: string;
    required: boolean,
    placeholder?: string;
    options?: { label: string; value: string }[];
}

export interface WorkflowStep {
    title: string;
    endpoint: CallableFunction;
}


