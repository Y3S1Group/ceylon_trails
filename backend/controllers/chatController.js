import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store conversation history in memory (for production, use Redis or database)
const conversationStore = new Map();

// Clean up old conversations (runs every hour)
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [sessionId, session] of conversationStore.entries()) {
    if (now - session.lastActivity > oneHour) {
      conversationStore.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);

export const chatWithAI = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    console.log("Received message:", message, "Session:", sessionId);

    // Get or create conversation history
    let conversation = conversationStore.get(sessionId);
    if (!conversation) {
      conversation = {
        messages: [],
        lastActivity: Date.now()
      };
      conversationStore.set(sessionId, conversation);
    }

    // Update last activity
    conversation.lastActivity = Date.now();

    // Add user message to history
    conversation.messages.push({
      role: "user",
      content: message
    });

    // Keep only last 10 messages to avoid token limits (adjust as needed)
    if (conversation.messages.length > 10) {
      conversation.messages = conversation.messages.slice(-10);
    }

    // Build messages array for OpenAI
    const messages = [
      {
        role: "system",
        content: `
You are a helpful AI travel assistant specialized in Sri Lanka. 
Keep answers short and useful.
Remember the conversation context and refer to previous messages when relevant.

IMPORTANT: You must ALWAYS respond with valid JSON in exactly this format:
{
  "reply": "Your helpful response text here...",
  "keywords": {
    "location": "City/Place name if mentioned",
    "tags": ["relevant", "tags"],
    "showPosts": false
  }
}

Rules:
1. Set "showPosts": true ONLY if the user explicitly asks for posts, experiences, or content from other travelers (e.g., "show me posts about Galle", "find posts from Kandy", "what do people share about beaches")
2. Set "showPosts": false for general travel questions, recommendations, or planning help
3. For locations, use Sri Lankan place names: Galle, Colombo, Kandy, Sigiriya, Ella, etc.
4. For tags, use: beach, temple, mountain, wildlife, history, culture, adventure, food, etc.
5. If no location/tags mentioned, use empty values but keep the structure
6. Reference previous parts of the conversation when relevant (e.g., "As I mentioned earlier..." or "Following up on your question about...")

Examples:
- "What to do in Galle?" → showPosts: false (just asking for advice)
- "Show me posts about Galle" → showPosts: true (explicitly asking for posts)
- "Find experiences in Kandy" → showPosts: true (asking for user content)

NEVER return plain text - ALWAYS return valid JSON.
`
      },
      ...conversation.messages
    ];

    console.log("Sending messages to AI:", messages);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 400,
      temperature: 0.7,
    });

    // Get AI response
    let aiText = completion.choices[0].message.content.trim();
    console.log("Raw AI response:", aiText);
    
    let aiData = {};
    try {
      // Try to parse as JSON
      aiData = JSON.parse(aiText);
      console.log("Parsed AI data:", aiData);
      
      // Validate the structure
      if (!aiData.reply) {
        throw new Error("Missing reply field");
      }
      if (!aiData.keywords) {
        aiData.keywords = { location: "", tags: [] };
      }
      if (!aiData.keywords.location) {
        aiData.keywords.location = "";
      }
      if (!Array.isArray(aiData.keywords.tags)) {
        aiData.keywords.tags = [];
      }
      if (typeof aiData.keywords.showPosts !== 'boolean') {
        aiData.keywords.showPosts = false;
      }
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("AI response that failed to parse:", aiText);
      
      // Fallback: treat the entire response as reply text
      aiData = { 
        reply: aiText, 
        keywords: { 
          location: "", 
          tags: [],
          showPosts: false
        } 
      };
    }

    // Add AI response to conversation history
    conversation.messages.push({
      role: "assistant",
      content: JSON.stringify(aiData)
    });

    console.log("Final AI data being sent:", aiData);

    res.json({
      success: true,
      ...aiData,
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "AI service failed",
      message: error.message 
    });
  }
};

// Optional: Add endpoint to clear conversation history
export const clearConversation = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId && conversationStore.has(sessionId)) {
      conversationStore.delete(sessionId);
    }
    
    res.json({ success: true, message: "Conversation cleared" });
  } catch (error) {
    console.error("Clear conversation error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to clear conversation" 
    });
  }
};