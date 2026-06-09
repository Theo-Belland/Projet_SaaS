import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

router.get("/admin-data", authMiddleware, adminOnly, async (req, res) => {
res.json({ message: "This is admin-only data" });
});

export default router;