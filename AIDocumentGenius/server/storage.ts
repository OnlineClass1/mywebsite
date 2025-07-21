import { files, processedResults, type File, type InsertFile, type ProcessedResult, type InsertProcessedResult } from "@shared/schema";

export interface IStorage {
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFile(id: number): Promise<File | undefined>;
  getRecentFiles(limit: number): Promise<File[]>;
  
  // Processed results operations
  createProcessedResult(result: InsertProcessedResult): Promise<ProcessedResult>;
  getProcessedResultsByFileId(fileId: number): Promise<ProcessedResult[]>;
  getProcessedResult(fileId: number, type: string, question?: string): Promise<ProcessedResult | undefined>;
}

export class MemStorage implements IStorage {
  private files: Map<number, File>;
  private processedResults: Map<number, ProcessedResult>;
  private currentFileId: number;
  private currentResultId: number;

  constructor() {
    this.files = new Map();
    this.processedResults = new Map();
    this.currentFileId = 1;
    this.currentResultId = 1;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const file: File = { 
      ...insertFile, 
      id,
      uploadedAt: new Date()
    };
    this.files.set(id, file);
    return file;
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getRecentFiles(limit: number): Promise<File[]> {
    return Array.from(this.files.values())
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(0, limit);
  }

  async createProcessedResult(insertResult: InsertProcessedResult): Promise<ProcessedResult> {
    const id = this.currentResultId++;
    const result: ProcessedResult = {
      ...insertResult,
      id,
      question: insertResult.question ?? null,
      createdAt: new Date()
    };
    this.processedResults.set(id, result);
    return result;
  }

  async getProcessedResultsByFileId(fileId: number): Promise<ProcessedResult[]> {
    return Array.from(this.processedResults.values())
      .filter(result => result.fileId === fileId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProcessedResult(fileId: number, type: string, question?: string): Promise<ProcessedResult | undefined> {
    return Array.from(this.processedResults.values())
      .find(result => 
        result.fileId === fileId && 
        result.type === type && 
        (type !== 'qa' || result.question === question)
      );
  }
}

export const storage = new MemStorage();
