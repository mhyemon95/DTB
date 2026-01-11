import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseDocxFile, ParsedBook } from "@/lib/docx-parser";

interface BookUploaderProps {
  onFileUpload: (file: File, parsedBook: ParsedBook) => void;
}

export function BookUploader({ onFileUpload }: BookUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedBook, setParsedBook] = useState<ParsedBook | null>(null);
  const [showJson, setShowJson] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setIsUploading(true);
        setUploadedFile(file);
        setError(null);
        
        try {
          const parsedBook = await parseDocxFile(file);
          setParsedBook(parsedBook);
          setIsUploading(false);
          onFileUpload(file, parsedBook);
        } catch (err) {
          console.error("Error parsing DOCX:", err);
          setError("Failed to parse the document. Please ensure it's a valid DOCX file.");
          setIsUploading(false);
        }
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setUploadedFile(null);
    setParsedBook(null);
    setShowJson(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!uploadedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative overflow-hidden rounded-2xl border-2 border-dashed p-12
                transition-all duration-300 cursor-pointer group
                ${
                  isDragActive
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-paper-dark"
                }
              `}
            >
              <input {...getInputProps()} />
              
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-4 w-32 h-32 border border-foreground rounded-lg rotate-12" />
                <div className="absolute bottom-4 right-4 w-24 h-24 border border-foreground rounded-lg -rotate-6" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-foreground rounded-full" />
              </div>

              <div className="relative flex flex-col items-center gap-6 text-center">
                <motion.div
                  animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`
                    p-6 rounded-2xl transition-colors duration-300
                    ${isDragActive ? "bg-primary text-primary-foreground" : "bg-secondary text-chapter"}
                  `}
                >
                  <Upload className="w-10 h-10" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-semibold text-foreground">
                    {isDragActive ? "Drop your manuscript here" : "Upload your manuscript"}
                  </h3>
                  <p className="text-muted-foreground">
                    Drag & drop your DOCX file, or{" "}
                    <span className="text-primary font-medium">browse</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Supports .docx files</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                  <FileText className="w-7 h-7 text-chapter" />
                </div>
                {!isUploading && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `${(uploadedFile.size / 1024).toFixed(1)} KB • Ready to convert`
                  )}
                </p>
              </div>

              {!isUploading && (
                <div className="flex gap-2">
                  {parsedBook && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowJson(!showJson)}
                      className="text-primary hover:text-primary"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {showJson ? 'Hide' : 'View'} JSON
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            {isUploading && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="mt-4 h-1 bg-primary rounded-full origin-left"
              />
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {showJson && parsedBook && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 rounded-lg border bg-muted p-4 max-h-96 overflow-auto"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">Generated JSON Structure</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(parsedBook.jsonData, null, 2));
                    }}
                    className="text-xs"
                  >
                    Copy
                  </Button>
                </div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                  {JSON.stringify(parsedBook.jsonData, null, 2)}
                </pre>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
