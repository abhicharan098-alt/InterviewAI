import { evaluateAnswer } from "../src/lib/ai/AnswerEvaluationService";

async function main() {
  const context = {
    role: "Frontend Developer",
    experienceLevel: "Fresher",
    interviewType: "Technical",
    difficulty: "Medium",
    question: "You mentioned using React. How did you use reusable components?",
    category: "TECHNICAL",
    answerText: "I used reusable React components to keep the UI modular and avoid duplicating code."
  };

  try {
    console.log("Evaluating test answer...");
    const result = await evaluateAnswer(context);
    console.log("Success! Result:", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("Evaluation Failed!");
    if (error.issues) {
      console.error("Zod Validation Issues:", JSON.stringify(error.issues, null, 2));
    } else {
      console.error("Error:", error);
    }
  }
}

main();
