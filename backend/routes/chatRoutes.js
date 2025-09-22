import express from "express";
import { chatWithAI, clearConversation } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", chatWithAI);
router.post("/clear", clearConversation);

export default router;
