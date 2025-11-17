Environment variables

- `VITE_OPENAI_API_KEY`: Your OpenAI API key used by client-side code (if required). For security, prefer storing API keys on a backend—do not expose them in client bundles for production.
- `GEMINI_API_KEY`: Your Gemini API key.

Local setup options:

- Create a `.env.local` file in the project root and add the keys (do NOT commit this file):

  `VITE_OPENAI_API_KEY=sk-...`

- PowerShell one-liner to create `.env.local` (replace `your-openai-key-here` with the real key):

  ```powershell
  Set-Content -Path .env.local -Value "VITE_OPENAI_API_KEY=your-openai-key-here" -Encoding UTF8
  ```

Notes:

- `.env.example` is provided as a template. Copy it to `.env.local` and fill in real values.
- Never commit `.env.local` or other files that contain secrets.
