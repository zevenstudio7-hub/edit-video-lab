// src/videoAnalysis/authTest.ts
import { GoogleGenAI } from "@google/genai";
import { loadEnvFile } from "node:process";
import path from "node:path";

async function main() {
  delete process.env.GEMINI_API_KEY;
  loadEnvFile(path.resolve(".env.local"));
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    process.exit(1);
  }

  const genAI = new GoogleGenAI({ apiKey });
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Hello",
    });
    console.log("Authentication successful.", result.text);
  } catch (error) {
    console.error("Authentication test failed:", {status: (error as {status?:number}).status});
    process.exit(1);
  }
  return;

}

main();
