# Agentic UI Playground

A Generative UI engine that uses the Google Gemini API to dynamically generate, mutate, and manage interactive web interfaces. This version includes a Serverless Function backend for secure online deployment.

## Features

* **Vanilla Tech Stack:** Built with pure HTML, CSS, and JavaScript. 
* **Agentic Event Loop:** Global event delegation intercepts user clicks on AI-generated elements and feeds them back to the LLM as system events.
* **Token Optimization:** The AI is prompted to return surgical Vanilla JS DOM mutations rather than rewriting the entire DOM for every interaction.
* **Context-Aware Memory:** Retains a sliding window of recent conversation turns while injecting a live snapshot of the HTML state into the system prompt.
* **Secure API Routing:** Uses a Vercel Serverless Function to keep the Gemini API key hidden from the client.

## Architecture

The engine enforces a strict JSON output from the LLM containing up to three keys:

1. `css_background`: Global CSS transitions.
2. `html_content`: Injects new DOM elements.
3. `js_logic`: Executes vanilla JavaScript via the `Function` constructor for low-latency state updates.

## Local Development

Since this project now uses a Serverless Function, it is recommended to use the Vercel CLI for local testing.

### 1. Install the Vercel CLI
\`\`\`bash
npm i -g vercel
\`\`\`

### 2. Clone the repository
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/agentic-ui-playground.git
cd agentic-ui-playground
\`\`\`

### 3. Link to Vercel and run locally
\`\`\`bash
vercel link
vercel env add GEMINI_API_KEY
vercel dev
\`\`\`
The application will run locally on `http://localhost:3000`.

## Deployment

To host this project online securely:

1. Push your code to a GitHub repository.
2. Log in to Vercel and import the repository.
3. In the Vercel project deployment settings, find Environment Variables.
4. Add a new variable named `GEMINI_API_KEY` and paste your actual Google API key as the value.
5. Click Deploy.

## Usage Examples

Enter the following prompts into the command bar to generate interfaces:

* "Give me a 3x3 Tic Tac Toe board. Dark theme."
* "Create a basic calculator interface."
* "Give me three buttons: one turns the background red, one green, one blue."

