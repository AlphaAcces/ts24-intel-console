import { GoogleGenAI } from '@google/genai';
import { AVAILABLE_MODELS } from '../config/availableModels';

type GenerateResult = {
    text: string;
};

function getEnv(key: string) {
    // Vite exposes env vars on import.meta.env when prefixed with VITE_
    // fall back to process.env for Node-based usage
    return (import.meta as any)?.env?.[key] ?? (process?.env as any)?.[key];
}

export async function generateWithModel(modelKey: string, prompt: string): Promise<GenerateResult> {
    const entry = AVAILABLE_MODELS.find(m => m.key === modelKey);
    if (!entry) throw new Error(`Unknown model key: ${modelKey}`);

    if (entry.provider === 'google') {
        const apiKey = getEnv('VITE_GEMINI_API_KEY') || getEnv('GEMINI_API_KEY') || getEnv('API_KEY');
        if (!apiKey) throw new Error('Missing Google (Gemini) API key. Set VITE_GEMINI_API_KEY in .env.local');
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({ model: entry.modelId, contents: prompt });
        // The Google SDK returns a response with `text` (as used in the repo previously)
        return { text: (response as any).text ?? JSON.stringify(response) };
    }

    if (entry.provider === 'openai') {
        const apiKey = getEnv('VITE_OPENAI_API_KEY');
        if (!apiKey) throw new Error('Missing OpenAI API key. Set VITE_OPENAI_API_KEY in .env.local');

        // Use OpenAI Responses API (fetch). This is a minimal wrapper and expects the Responses API shape.
        const endpoint = 'https://api.openai.com/v1/responses';
        const body = {
            model: entry.modelId,
            input: prompt
        };

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`OpenAI request failed: ${res.status} ${res.statusText} - ${text}`);
        }

        const data = await res.json();
        // Responses API may return text under data.output[0].content[0].text or data.output_text
        let out = '';
        if (data.output_text) out = data.output_text;
        else if (data.output && Array.isArray(data.output) && data.output[0]?.content) {
            const content = data.output[0].content;
            const txtPart = content.find((c: any) => c.type === 'output_text' || c.type === 'text');
            out = txtPart ? txtPart.text ?? txtPart.content : JSON.stringify(content);
        } else if (data.choices && data.choices[0]) {
            out = data.choices[0].message?.content ?? data.choices[0].text ?? JSON.stringify(data.choices[0]);
        } else {
            out = JSON.stringify(data);
        }

        return { text: out };
    }

    // For providers not implemented in the wrapper, return clear guidance
    throw new Error(`${entry.provider} provider not implemented in this client. Please add server-side support or extend src/lib/ai.ts`);
}
