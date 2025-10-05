
import express from "express";
import ollama from "ollama";

const router = express.Router();



router.post("/ask", async (req, res) => {
  const { conversationHistory, prompt, model, systemMessage, images } =
    req.body;

  try {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const system = {
      role: "system",
      content: systemMessage,
    };

    const messages = conversationHistory
      ? [system, ...conversationHistory]
      : [system];

    const response = await ollama.chat({
      model: model,
      messages: [
        ...messages,
        {
          role: "user",
          content: prompt,
          images: images,
        },
      ],
      stream: true,
    });

    for await (const part of response) {
      // Filter out thinking tags from models like qwen
      let content = part.message.content;
      if (content) {
        // Remove <think>...</think> tags and their content
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
        // Clean up any remaining empty lines
        content = content.replace(/^\s*[\r\n]/gm, '');
        
        if (content.trim()) {
          res.write(content);
        }
      }
    }

    res.end();
  } catch (error) {
    res.status(500).send("An error occurred while processing your request.");
    console.log(error);
  }
});

export default router;
