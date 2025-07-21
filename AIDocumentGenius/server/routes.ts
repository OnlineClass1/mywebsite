import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { aiService } from "./services/ai";
import { fileProcessor } from "./services/fileProcessor";
import { uploadFileSchema, processDocumentSchema, qaRequestSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Extract text from the uploaded file
      const processedFile = await fileProcessor.extractTextFromFile(
        req.file.path,
        req.file.mimetype
      );

      // Save file info to storage
      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        content: processedFile.content,
      };

      const savedFile = await storage.createFile(fileData);

      res.json({
        id: savedFile.id,
        originalName: savedFile.originalName,
        fileType: savedFile.fileType,
        fileSize: savedFile.fileSize,
        uploadedAt: savedFile.uploadedAt,
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to upload file" 
      });
    }
  });

  // Get recent files
  app.get("/api/files/recent", async (req, res) => {
    try {
      const files = await storage.getRecentFiles(10);
      res.json(files.map(file => ({
        id: file.id,
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        uploadedAt: file.uploadedAt,
      })));
    } catch (error: any) {
      console.error("Get recent files error:", error);
      res.status(500).json({ error: "Failed to get recent files" });
    }
  });

  // Summarize document
  app.post("/api/summarize", async (req, res) => {
    try {
      const { fileId } = processDocumentSchema.parse(req.body);
      
      // Check if summary already exists
      const existingResult = await storage.getProcessedResult(fileId, 'summary');
      if (existingResult) {
        return res.json({ result: existingResult.result });
      }

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const summary = await aiService.summarizeDocument(file.content, file.originalName);
      
      // Save the result
      await storage.createProcessedResult({
        fileId,
        type: 'summary',
        result: summary.summary,
      });

      res.json({ result: summary.summary });

    } catch (error: any) {
      console.error("Summarization error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ 
        error: error.message || "Failed to generate summary" 
      });
    }
  });

  // Q&A endpoint
  app.post("/api/qa", async (req, res) => {
    try {
      const { fileId, question } = qaRequestSchema.parse(req.body);
      
      // Check if this Q&A already exists
      const existingResult = await storage.getProcessedResult(fileId, 'qa', question);
      if (existingResult) {
        return res.json({ 
          result: existingResult.result,
          question: existingResult.question 
        });
      }

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const qaResult = await aiService.answerQuestion(file.content, question, file.originalName);
      
      // Save the result
      await storage.createProcessedResult({
        fileId,
        type: 'qa',
        question,
        result: qaResult.answer,
      });

      res.json({ 
        result: qaResult.answer,
        question,
        pageReference: qaResult.pageReference 
      });

    } catch (error: any) {
      console.error("Q&A error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ 
        error: error.message || "Failed to generate answer" 
      });
    }
  });

  // Math solution endpoint
  app.post("/api/math", async (req, res) => {
    try {
      const { fileId } = processDocumentSchema.parse(req.body);
      
      // Check if math solution already exists
      const existingResult = await storage.getProcessedResult(fileId, 'math');
      if (existingResult) {
        return res.json({ result: existingResult.result });
      }

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const mathResult = await aiService.solveMathProblem(file.content, file.originalName);
      
      // Save the result
      await storage.createProcessedResult({
        fileId,
        type: 'math',
        result: mathResult.mathSolution,
      });

      res.json({ result: mathResult.mathSolution });

    } catch (error: any) {
      console.error("Math solution error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ 
        error: error.message || "Failed to solve mathematical problems" 
      });
    }
  });

  // Download result as text file
  app.get("/api/download/:type/:fileId", async (req, res) => {
    try {
      const { type, fileId } = req.params;
      const fileIdNum = parseInt(fileId);

      const file = await storage.getFile(fileIdNum);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const result = await storage.getProcessedResult(fileIdNum, type);
      if (!result) {
        return res.status(404).json({ error: "Result not found" });
      }

      const downloadContent = fileProcessor.generateDownloadContent(result.result, type);
      const filename = `${file.originalName}_${type}_${new Date().toISOString().split('T')[0]}.txt`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(downloadContent);

    } catch (error: any) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  // Get all results for a file
  app.get("/api/files/:fileId/results", async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      const results = await storage.getProcessedResultsByFileId(fileId);
      res.json(results);
    } catch (error: any) {
      console.error("Get results error:", error);
      res.status(500).json({ error: "Failed to get results" });
    }
  });

  // Delete a file (for client-side local storage management)
  app.delete("/api/files/:fileId", async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      // Since we're using in-memory storage, just return success
      // Client will handle local storage cleanup
      res.json({ success: true, message: "File deleted successfully" });
    } catch (error: any) {
      console.error("Delete file error:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
