import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";
import { BookOpen, MessageCircle, Calculator, Upload, Type } from "lucide-react";

interface ModeSelectorProps {
  selectedMode: string | null;
  onModeSelect: (mode: string) => void;
  onProceedToUpload: () => void;
  onTextInput: (text: string, mode: string) => void;
}

export default function ModeSelector({ selectedMode, onModeSelect, onProceedToUpload, onTextInput }: ModeSelectorProps) {
  const [inputText, setInputText] = useState("");
  const [inputMethod, setInputMethod] = useState<'text' | 'document'>('text');

  const modes = [
    { 
      id: "summary", 
      label: "Summary", 
      icon: BookOpen,
      description: "Get a comprehensive summary with main points, bullets, and key takeaways"
    },
    { 
      id: "qa", 
      label: "Q&A", 
      icon: MessageCircle,
      description: "Ask questions about your content and get detailed answers"
    },
    { 
      id: "math", 
      label: "Math Solution", 
      icon: Calculator,
      description: "Solve math problems including stats, accounting, finance, and more"
    }
  ];

  const handleModeSelect = (modeId: string) => {
    onModeSelect(modeId);
  };

  const handleFileUploaded = (fileData: any) => {
    // This will be handled by the parent component
    onProceedToUpload();
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection Buttons */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Choose Your Processing Mode</h2>
        <div className="flex justify-center space-x-4 mb-8">
          {modes.map((mode) => (
            <Button
              key={mode.id}
              variant={selectedMode === mode.id ? "default" : "outline"}
              onClick={() => handleModeSelect(mode.id)}
              className="flex items-center space-x-2 px-6 py-3 h-auto"
            >
              <mode.icon className="w-5 h-5" />
              <span className="font-medium">{mode.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Content Input Area */}
      {selectedMode && (
        <Card className="mx-auto max-w-4xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {modes.find(m => m.id === selectedMode)?.label} Mode Selected
              </h3>
              <p className="text-muted-foreground">
                {modes.find(m => m.id === selectedMode)?.description}
              </p>
            </div>

            {/* Input Method Toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={inputMethod === 'text' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setInputMethod('text')}
                  className="flex items-center space-x-2"
                >
                  <Type className="w-4 h-4" />
                  <span>Enter Text</span>
                </Button>
                <Button
                  variant={inputMethod === 'document' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setInputMethod('document')}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </Button>
              </div>
            </div>

            {/* Text Input Area */}
            {inputMethod === 'text' && (
              <div className="space-y-4">
                <Textarea
                  placeholder={`Enter your text for ${selectedMode === 'summary' ? 'summarization' : selectedMode === 'qa' ? 'Q&A analysis' : 'math solution'}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="text-center">
                  <Button
                    onClick={() => {
                      if (inputText.trim() && selectedMode) {
                        onTextInput(inputText.trim(), selectedMode);
                      }
                    }}
                    disabled={!inputText.trim()}
                    className="px-8 py-2"
                  >
                    Process Text
                  </Button>
                </div>
              </div>
            )}

            {/* File Upload Area */}
            {inputMethod === 'document' && (
              <div>
                <FileUpload onFileUploaded={handleFileUploaded} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}