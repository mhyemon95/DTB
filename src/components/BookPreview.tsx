import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Maximize2, Minimize2, X, Edit3, Check } from "lucide-react";
import { renderAsync } from "docx-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormattingToolbar } from "./FormattingToolbar";
import { useToast } from "@/hooks/use-toast";

interface BookPreviewProps {
  title: string;
  chapters: any[];
  rawHtml?: string;
  file?: File;
}

function convertDataAttributesToStyles(html: string): string {
  return html;
}

export function BookPreview({ title, rawHtml, file }: BookPreviewProps & { rawHtml: string }) {
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const fullScreenContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const renderContent = async (container: HTMLElement) => {
    if (!file) return;
    container.innerHTML = "";
    try {
      const buf = await file.arrayBuffer();
      await renderAsync(buf, container, undefined, {
        inWrapper: false,
        useBase64URL: true,
        debug: false,
        experimental: true,
      });
    } catch (e) {
      console.error("docx-preview failed", e);
    }
  };

  useEffect(() => {
    if (docxContainerRef.current) {
      renderContent(docxContainerRef.current);
    }
  }, [file]);

  useEffect(() => {
    if (isFullscreen && fullScreenContainerRef.current) {
      setTimeout(() => {
        if (fullScreenContainerRef.current) {
          renderContent(fullScreenContainerRef.current);
        }
      }, 100);
    }
  }, [isFullscreen, file]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const toggleEditMode = () => {
    if (!isEditing) {
      toast({
        title: "Edit Mode Enabled ✏️",
        description: "Edits will appear in PDF export ONLY. DOCX export uses original file.",
        duration: 5000,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Force focus back to edited content if needed, though execCommand usually works on selection
  };

  return (
    <>
      <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-book border border-border bg-card relative group">
        <div className="h-full flex flex-col">
          <div className="px-8 py-4 border-b border-border bg-paper flex items-center justify-between relative">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mx-auto">
              <FileText className="w-4 h-4" />
              <span>{title}</span>
            </div>

            <div className="absolute right-4 top-3 flex items-center gap-2">
              <Button
                variant={isEditing ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "transition-colors",
                  !isEditing && "text-muted-foreground hover:text-primary"
                )}
                onClick={toggleEditMode}
                title={isEditing ? "Done Editing" : "Edit Mode"}
              >
                {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={toggleFullscreen}
                title="Full Screen Preview"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white relative">
            {isEditing && (
              <div className="sticky top-4 z-50 mb-4 px-4">
                <FormattingToolbar onFormat={handleFormat} />
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "max-w-4xl mx-auto py-8 px-8 transition-all outline-none",
                isEditing && "ring-2 ring-primary/20 rounded-lg min-h-[500px]"
              )}
            >
              {file ? (
                <div
                  ref={docxContainerRef}
                  className={cn("docx", isEditing && "editing-active")}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                />
              ) : (
                <div
                  className="prose prose-lg max-w-none book-content"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{
                    __html: convertDataAttributesToStyles(rawHtml)
                  }}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
          >
            <div className="h-full flex flex-col bg-white overflow-hidden">
              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-paper shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-xs text-muted-foreground">Full Screen Preview</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={toggleFullscreen} className="gap-2">
                    <Minimize2 className="w-4 h-4" />
                    Exit Full Screen
                  </Button>
                  <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="max-w-5xl mx-auto bg-white shadow-xl min-h-full p-12 rounded-lg">
                  {file ? (
                    <div ref={fullScreenContainerRef} className="docx" />
                  ) : (
                    <div
                      className="prose prose-xl max-w-none book-content"
                      dangerouslySetInnerHTML={{
                        __html: convertDataAttributesToStyles(rawHtml)
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
