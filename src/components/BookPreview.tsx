import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Maximize2, Minimize2, X } from "lucide-react";
import { ParsedBook } from "@/lib/docx-parser";
import { renderAsync } from "docx-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookPreviewProps {
  title: string;
  chapters: any[];
  rawHtml?: string;
  file?: File;
}

function convertDataAttributesToStyles(html: string): string {
  // Return HTML as-is since we're now preserving original inline styles
  return html;
}

export function BookPreview({ title, rawHtml, file }: BookPreviewProps & { rawHtml: string }) {
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const fullScreenContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Render function to handle both normal and fullscreen modes
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

  // Initial render
  useEffect(() => {
    if (docxContainerRef.current) {
      renderContent(docxContainerRef.current);
    }
  }, [file]);

  // Handle fullscreen render when toggled
  useEffect(() => {
    if (isFullscreen && fullScreenContainerRef.current) {
      // Small delay to ensure container is ready
      setTimeout(() => {
        if (fullScreenContainerRef.current) {
          renderContent(fullScreenContainerRef.current);
        }
      }, 100);
    }
  }, [isFullscreen, file]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <>
      <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-book border border-border bg-card relative group">
        <div className="h-full flex flex-col">
          <div className="px-8 py-4 border-b border-border bg-paper flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mx-auto">
              <FileText className="w-4 h-4" />
              <span>{title}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-3 text-muted-foreground hover:text-primary transition-colors"
              onClick={toggleFullscreen}
              title="Full Screen Preview"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto py-8 px-8"
            >
              {file ? (
                <div ref={docxContainerRef} className="docx" />
              ) : (
                <div
                  className="prose prose-lg max-w-none book-content"
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
