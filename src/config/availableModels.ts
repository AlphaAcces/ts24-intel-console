export type ModelEntry = {
    key: string; // provider:modelId unique key
    provider: 'openai' | 'google' | 'raptor' | 'other';
    modelId: string;
    name: string;
    description?: string;
    implemented?: boolean; // whether front-end wrapper implements this provider
};

// List of available models. Keep keys as `provider:modelId` to make routing explicit.
export const AVAILABLE_MODELS: ModelEntry[] = [
    { key: 'google:gemini-2.5-flash', provider: 'google', modelId: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Google Gemini (existing)', implemented: true },
    { key: 'openai:gpt-4.1', provider: 'openai', modelId: 'gpt-4.1', name: 'GPT-4.1', description: 'OpenAI GPT-4.1', implemented: true },
    { key: 'openai:gpt-5-mini', provider: 'openai', modelId: 'gpt-5-mini', name: 'GPT-5 mini', description: 'OpenAI GPT-5 mini (if available)', implemented: true },
    { key: 'openai:gpt-4o', provider: 'openai', modelId: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI GPT-4o', implemented: true },
    { key: 'raptor:raptor-mini', provider: 'raptor', modelId: 'raptor-mini', name: 'Raptor mini (Preview)', description: 'Raptor family (preview) — provider integration not implemented by default', implemented: false },
    { key: 'other:latest', provider: 'other', modelId: 'latest', name: 'Other / Custom', description: 'Map to a custom provider manually', implemented: false }
];

export const DEFAULT_MODEL_KEY = 'google:gemini-2.5-flash';
