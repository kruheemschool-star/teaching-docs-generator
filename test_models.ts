
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCIWg1ypEmkkvTre_zoacOL82QO0dK8_FQ"; // Hardcoding for this test script only
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; // Hack to init? No, listModels is on genAI? 
        // Actually listModels is usually on the client. Checking docs... or just trying a known working model.
        // The error message itself suggested: "Call ListModels to see the list of available models"

        // Attempting to use a standard way if available, or just trying "gemini-pro" which is standard.
        // But let's try to verify via a simple generation with "gemini-pro" which is the safest bet.

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro is WORKING. Response:", result.response.text());
    } catch (error: any) {
        console.error("gemini-pro FAILED:", error.message);
    }

    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result2 = await model2.generateContent("Hello");
        console.log("gemini-1.5-flash is WORKING. Response:", result2.response.text());
    } catch (error: any) {
        console.error("gemini-1.5-flash FAILED:", error.message);
    }
}

listModels();
