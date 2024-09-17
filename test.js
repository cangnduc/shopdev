const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const endpoint = "https://models.inference.ai.azure.com";
const apiKey = process.env.GITHUB_TOKEN;
const modelName = "gpt-4o-mini";

async function main() {
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: endpoint,
    // defaultQuery: { "api-version": "2023-03-15-preview" },
    // defaultHeaders: { "api-key": apiKey },
  });

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What is the capital of France?" },
    ],
    model: modelName,
    // Optional parameters
    temperature: 1,
    max_tokens: 1000,
    top_p: 1,
  });

  console.log(response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
