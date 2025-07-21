import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  MessageCircle, 
  Calculator, 
  Copy, 
  Download, 
  Send,
  Loader2,
  Check,
  MapPin,
  BookOpen 
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProcessingTabsProps {
  uploadedFile: any;
  selectedMode?: string | null;
}

export default function ProcessingTabs({ uploadedFile, selectedMode }: ProcessingTabsProps) {
  const [activeTab, setActiveTab] = useState(selectedMode || "summary");
  const [question, setQuestion] = useState("");
  const [summaryResult, setSummaryResult] = useState<string>("");
  const [qaResults, setQAResults] = useState<any[]>([]);
  const [mathResult, setMathResult] = useState<string>("");
  const { toast } = useToast();

  const tabs = [
    { id: "summary", label: "Summary", icon: FileText },
    { id: "qa", label: "Q&A", icon: MessageCircle },
    { id: "math", label: "Math Solution", icon: Calculator },
  ];

  // Set active tab based on selected mode
  useEffect(() => {
    if (selectedMode) {
      setActiveTab(selectedMode);
    }
  }, [selectedMode]);

  // Auto-generate content based on selected mode when file is uploaded
  useEffect(() => {
    if (uploadedFile && selectedMode) {
      if (selectedMode === "summary" && !summaryResult) {
        generateSummary();
      } else if (selectedMode === "math" && !mathResult) {
        solveMathProblem();
      }
      // For Q&A mode, wait for user to ask questions
    }
  }, [uploadedFile, selectedMode]);

  const summaryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/summarize", {
        fileId: uploadedFile.id,
        type: "summary",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSummaryResult(data.result);
      toast({
        title: "Summary Ready!",
        description: "Your document has been summarized successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Summarization failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const qaMutation = useMutation({
    mutationFn: async (questionText: string) => {
      const response = await apiRequest("POST", "/api/qa", {
        fileId: uploadedFile.id,
        question: questionText,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const newQA = {
        id: Date.now(),
        question: data.question,
        answer: data.result,
        pageReference: data.pageReference,
      };
      setQAResults(prev => [newQA, ...prev]);
      setQuestion("");
      toast({
        title: "Answer ready!",
        description: "Your question has been answered.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Q&A failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const mathMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/math", {
        fileId: uploadedFile.id,
        type: "math",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMathResult(data.result);
      toast({
        title: "Math Problems Solved!",
        description: "Your mathematical problems have been solved step-by-step.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Math solution failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateSummary = () => {
    summaryMutation.mutate();
  };

  const askQuestion = () => {
    if (!question.trim()) return;
    qaMutation.mutate(question);
  };

  const solveMathProblem = () => {
    mathMutation.mutate();
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text.replace(/<[^>]*>/g, ''));
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (content: string, type: string) => {
    window.open(`/api/download/${type}/${uploadedFile.id}`, '_blank');
  };

  const isTabDisabled = !uploadedFile;

  return (
    <Card className="w-full shadow-xl border-border">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-0" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={`tab-button flex-1 py-4 px-6 rounded-none font-medium border-b-2 transition-all duration-200 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                } ${isTabDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                style={isActive ? { backgroundColor: 'hsl(var(--primary) / 0.1)' } : undefined}
                disabled={isTabDisabled}
                onClick={() => !isTabDisabled && setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {tab.id === "summary" ? "Smart " : ""}
                </span>
                {tab.label.replace("Smart ", "")}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <CardContent className="p-6 sm:p-8">
        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div>
            {!uploadedFile ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Upload a document to get started
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Once you upload a document, I'll generate an intelligent summary with key points and insights.
                </p>
              </div>
            ) : (
              <div>
                {summaryMutation.isPending && (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating summary...</p>
                  </div>
                )}
                
                {summaryResult && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Smart Summary Ready!
                        </h3>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(summaryResult)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(summaryResult, "summary")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <div 
                      className="prose dark:prose-invert max-w-none rounded-xl p-6"
                      style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                      dangerouslySetInnerHTML={{ __html: summaryResult }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === "qa" && (
          <div>
            {!uploadedFile ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Upload a document to ask questions
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Once you upload a document, you can ask any questions about its content and get detailed answers with page references.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Ask your question from the document below
                  </h3>
                  
                  <div className="flex space-x-3">
                    <Input
                      type="text"
                      placeholder="What is the main topic of this document?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && askQuestion()}
                      className="flex-1"
                    />
                    <Button
                      onClick={askQuestion}
                      disabled={!question.trim() || qaMutation.isPending}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      {qaMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Ask
                    </Button>
                  </div>
                </div>

                {/* Q&A Results */}
                <div className="space-y-6">
                  {qaResults.map((qa) => (
                    <div key={qa.id} className="space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MessageCircle className="w-3 h-3 text-white" />
                          </div>
                          <p className="font-medium text-blue-800 dark:text-blue-200">
                            {qa.question}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <div 
                              className="prose dark:prose-invert prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: qa.answer }}
                            />
                            
                            <div className="mt-3 flex items-center justify-between">
                              {qa.pageReference && (
                                <span className="text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3 mr-1 inline" />
                                  Reference: {qa.pageReference}
                                </span>
                              )}
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopy(qa.answer)}
                                  className="text-xs"
                                >
                                  <Copy className="w-3 h-3 mr-1" />Copy
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleDownload(qa.answer, "qa")}
                                  className="text-xs"
                                >
                                  <Download className="w-3 h-3 mr-1" />Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Math Solution Tab */}
        {activeTab === "math" && (
          <div>
            {!uploadedFile ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Calculator className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Upload a document to solve math problems
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Solve mathematical problems including statistics, accounting, finance, and more with step-by-step solutions.
                </p>
              </div>
            ) : (
              <div>
                {!mathResult && (
                  <div className="mb-6 text-center">
                    <Button
                      onClick={solveMathProblem}
                      disabled={mathMutation.isPending}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 glow-button"
                    >
                      {mathMutation.isPending ? (
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      ) : (
                        <Calculator className="w-5 h-5 mr-3" />
                      )}
                      {mathMutation.isPending ? "Solving..." : "Solve Math Problems"}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-3">
                      AI will identify and solve mathematical problems step-by-step
                    </p>
                  </div>
                )}

                {mathResult && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                          <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Math Solutions
                        </h3>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(mathResult)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(mathResult, "math")}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <div 
                      className="prose dark:prose-invert max-w-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6"
                      dangerouslySetInnerHTML={{ __html: mathResult }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
