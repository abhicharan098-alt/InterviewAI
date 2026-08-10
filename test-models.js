require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test(modelName) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("hello");
    console.log(`Success for ${modelName}`);
  } catch (err) {
    console.error(`Failed for ${modelName}:`, err.message);
  }
}

async function main() {
  await test("gemini-1.5-flash");
  await test("gemini-1.5-flash-latest");
  await test("gemini-pro");
}
main();
