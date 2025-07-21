import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/components/ThemeProvider";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import ProcessingTabs from "@/components/ProcessingTabs";
import ModeSelector from "@/components/ModeSelector";
import { Brain, Moon, Sun, FileText, Clock, Trash2, X } from "lucide-react";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [recentFiles, setRecentFiles] = useLocalStorage<any[]>("recent-files", []);

  const { data: recentFilesFromServer } = useQuery({
    queryKey: ["/api/files/recent"],
    enabled: false, // Only fetch when needed
  });

  const handleFileUploaded = (fileData: any) => {
    setUploadedFile({ ...fileData, selectedMode });
    
    // Add to recent files with selected mode
    const fileWithMode = { ...fileData, selectedMode };
    const newRecentFiles = [fileWithMode, ...recentFiles.filter(f => f.id !== fileData.id)].slice(0, 5);
    setRecentFiles(newRecentFiles);
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
  };

  const handleProceedToUpload = () => {
    setShowUpload(true);
  };

  const handleDeleteRecentFile = (fileId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRecentFiles = recentFiles.filter(f => f.id !== fileId);
    setRecentFiles(newRecentFiles);
  };

  const handleSelectRecentFile = (file: any) => {
    setSelectedMode(file.selectedMode || "summary");
    setUploadedFile(file);
    setShowUpload(true);
  };

  const handleStartOver = () => {
    setSelectedMode(null);
    setShowUpload(false);
    setUploadedFile(null);
  };

  const handleTextInput = (text: string, mode: string) => {
    // Create a mock file object for text input
    const textFile = {
      id: Date.now(),
      originalName: `Text Input - ${mode}`,
      filename: `text_${Date.now()}.txt`,
      fileType: 'text/plain',
      fileSize: text.length,
      content: text,
      uploadedAt: new Date().toISOString(),
      selectedMode: mode
    };
    
    setUploadedFile(textFile);
    
    // Add to recent files
    const newRecentFiles = [textFile, ...recentFiles.filter(f => f.id !== textFile.id)].slice(0, 5);
    setRecentFiles(newRecentFiles);
    
    setShowUpload(true);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'text-red-600 dark:text-red-400';
    if (fileType.includes('word') || fileType.includes('document')) return 'text-blue-600 dark:text-blue-400';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const uploaded = new Date(date);
    const diffInHours = Math.floor((now.getTime() - uploaded.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Document Genius
                </h1>
                <p className="text-xs text-muted-foreground">Smart Document Processing</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!showUpload && (
          <>
            {/* Mode Selection */}
            <section className="mb-8">
              <ModeSelector 
                selectedMode={selectedMode}
                onModeSelect={handleModeSelect}
                onProceedToUpload={handleProceedToUpload}
                onTextInput={handleTextInput}
              />
            </section>
          </>
        )}

        {showUpload && (
          <>
            {/* Start Over Button */}
            <div className="mb-6 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleStartOver}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Start Over</span>
              </Button>
              {selectedMode && (
                <div className="text-sm text-muted-foreground">
                  Selected mode: <span className="font-medium text-foreground capitalize">{selectedMode}</span>
                </div>
              )}
            </div>

            {/* File Upload Section */}
            <section className="mb-8">
              <FileUpload onFileUploaded={handleFileUploaded} />
            </section>

            {/* Processing Tabs */}
            <section className="mb-8">
              <ProcessingTabs uploadedFile={uploadedFile} selectedMode={selectedMode} />
            </section>
          </>
        )}

        {/* Recent Files */}
        {recentFiles.length > 0 && (
          <section className="mb-8">
            <Card className="shadow-xl border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
                  Recent Files
                </h3>
                
                <div className="space-y-3">
                  {recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors duration-200 cursor-pointer"
                      style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                      onClick={() => handleSelectRecentFile(file)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center">
                          <FileText className={`w-4 h-4 ${getFileIcon(file.fileType)}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{file.originalName}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.uploadedAt ? formatTimeAgo(file.uploadedAt) : 'Recently uploaded'} • {formatFileSize(file.fileSize)}
                            {file.selectedMode && (
                              <span 
                                className="ml-2 px-2 py-1 text-primary rounded text-xs capitalize"
                                style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                              >
                                {file.selectedMode === 'math' ? 'Math Solution' : file.selectedMode}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => handleDeleteRecentFile(file.id, e)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-muted-foreground">AI Document Genius</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by advanced AI • Secure & Private
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
