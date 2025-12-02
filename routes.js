import dotenv from "dotenv";
import express from "express";
import Groq from "groq-sdk";

dotenv.config({
    path: ".env"
});

const router = express.Router();


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


router.get("/", (req, res) => {
    res.status(200).json({ message: "Server started.", status: 200 });
});


router.post("/api/email", async (req, res) => {
    try {
        const { message, tone, mode } = req.body;

        if (!message || !tone || !mode) {
            return res.status(400).json({ error: "Missing required fields (message, tone, mode)" });
        }

        const systemPrompt = `
        You are an advanced AI Email Writing Assistant that converts raw user messages into polished, ready-to-send emails.

        RULES:
        - Understand the user’s intent, context, and emotion.
        - Match the chosen TONE: professional, friendly, persuasive, apologetic.
        - Match the chosen MODE: formal, casual, concise, detailed.
        - Always output: Greeting, polished body, closing line, and a professional sign-off.
        - Do NOT invent facts, do NOT mention you are an AI, do NOT add explanations.
        - Only return the final email body text.
        `;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify({ message, tone, mode }) }
            ],
            temperature: 0.25,
            max_tokens: 600
        });

        const emailText = completion?.choices?.[0]?.message?.content ?? "";

        return res.status(200).json({ email: emailText });

    } catch (err) {
        console.error("AI Error:", err);
        return res.status(500).json({
            error: "Failed to generate email. See server logs.",
            details: err?.message
        });
    }
});


export default router;