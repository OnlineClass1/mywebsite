import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, FileUp, Check, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onFileUploaded: (fileData: any) => void;
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFile(data);
      onFileUploaded(data);
      toast({
        title: "File uploaded successfully!",
        description: `${data.originalName} is ready for processing.`,
      });
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again with a different file.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, PPT, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const isLoading = uploadMutation.isPending;
  const isSuccess = uploadedFile && !isLoading;

  return (
    <Card className="w-full shadow-xl border-border">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Upload Your Document
          </h2>
          <p className="text-muted-foreground">
            Support for PDF, PPT, DOCX, and TXT files • No size limits
          </p>
        </div>

        <div
          className={`upload-zone p-8 sm:p-12 text-center ${
            dragActive ? "dragover" : ""
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          {isLoading ? (
            <div>
              <div className="w-16 h-16 mx-auto mb-4">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Processing your document...
              </h3>
              <p className="text-muted-foreground">
                This may take a few moments
              </p>
            </div>
          ) : isSuccess ? (
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-200 mb-2">
                Document uploaded successfully!
              </h3>
              <p className="text-muted-foreground">
                {uploadedFile.originalName} • Ready for processing
              </p>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center">
                <CloudUpload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Drag & drop your file here
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Button
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
              >
                <FileUp className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
          onChange={handleFileSelect}
        />
      </CardContent>
    </Card>
  );
}
