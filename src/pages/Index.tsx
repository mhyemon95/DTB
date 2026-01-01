import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { BookUploader } from "@/components/BookUploader";
import { BookPreview } from "@/components/BookPreview";
import { ExportOptions } from "@/components/ExportOptions";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ParsedBook, BookChapter } from "@/lib/docx-parser";

type Step = "landing" | "upload" | "preview" | "export";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("landing");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedBook, setParsedBook] = useState<ParsedBook | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    setCurrentStep("upload");
    setTimeout(() => {
      uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleFileUpload = (file: File, book: ParsedBook) => {
    setUploadedFileName(file.name.replace(".docx", ""));
    setUploadedFile(file);
    setParsedBook(book);
    setTimeout(() => {
      setCurrentStep("preview");
    }, 500);
  };

  const stepConfig = {
    landing: { prev: null, next: "upload" },
    upload: { prev: "landing", next: null },
    preview: { prev: "upload", next: "export" },
    export: { prev: "preview", next: null },
  };

  const bookTitle = parsedBook?.title || uploadedFileName || "My Untitled Book";
  const bookChapters: BookChapter[] = parsedBook?.chapters || [];

  return (
    <>
      <Helmet>
        <title>BookForge - Transform Documents into Beautiful Books</title>
        <meta
          name="description"
          content="Upload your DOCX manuscript and transform it into a professionally formatted book. Export as PDF, EPUB, or DOCX in minutes."
        />
      </Helmet>

      <div className="min-h-screen gradient-hero">
        <Header onGetStarted={handleGetStarted} />

        <main className="pt-24">
          <AnimatePresence mode="wait">
            {currentStep === "landing" && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Hero onGetStarted={handleGetStarted} />
                <Features />
              </motion.div>
            )}

            {currentStep !== "landing" && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-7xl mx-auto px-6 py-12"
              >
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                  {["upload", "preview", "export"].map((step, index) => (
                    <div key={step} className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          if (step === "upload" || (step === "preview" && uploadedFileName) || (step === "export" && uploadedFileName)) {
                            setCurrentStep(step as Step);
                          }
                        }}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                          ${currentStep === step
                            ? "bg-primary text-primary-foreground shadow-card"
                            : step === "upload" || uploadedFileName
                              ? "bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          }
                        `}
                        disabled={step !== "upload" && !uploadedFileName}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === step
                              ? "bg-primary-foreground/20"
                              : "bg-muted"
                            }`}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium capitalize">{step}</span>
                      </button>
                      {index < 2 && (
                        <div
                          className={`w-12 h-0.5 rounded-full ${(index === 0 && (currentStep === "preview" || currentStep === "export")) ||
                              (index === 1 && currentStep === "export")
                              ? "bg-primary"
                              : "bg-border"
                            }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  {currentStep === "upload" && (
                    <motion.div
                      key="upload-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      ref={uploadSectionRef}
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif font-semibold text-foreground mb-2">
                          Upload Your Manuscript
                        </h2>
                        <p className="text-muted-foreground">
                          We'll automatically parse and structure your content
                        </p>
                      </div>
                      <BookUploader onFileUpload={handleFileUpload} />
                    </motion.div>
                  )}

                  {currentStep === "preview" && bookChapters.length > 0 && (
                    <motion.div
                      key="preview-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif font-semibold text-foreground mb-2">
                          Preview Your Book
                        </h2>
                        <p className="text-muted-foreground">
                          Review the structure and content before exporting
                        </p>
                      </div>
                      <BookPreview title={bookTitle} chapters={bookChapters} rawHtml={parsedBook?.rawHtml || ""} file={uploadedFile || undefined} />
                    </motion.div>
                  )}

                  {currentStep === "export" && (
                    <motion.div
                      key="export-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ExportOptions
                        bookTitle={bookTitle}
                        uploadedFile={uploadedFile}
                        rawHtml={parsedBook?.rawHtml || ""}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12 max-w-2xl mx-auto">
                  {stepConfig[currentStep].prev ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentStep(stepConfig[currentStep].prev as Step)
                      }
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  {stepConfig[currentStep].next && uploadedFileName && (
                    <Button
                      variant="default"
                      onClick={() =>
                        setCurrentStep(stepConfig[currentStep].next as Step)
                      }
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
