import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Book, FileDown, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// @ts-ignore
import html2pdf from "html2pdf.js";

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  extension: string;
  popular?: boolean;
}

const formats: ExportFormat[] = [
  {
    id: "pdf",
    name: "PDF",
    description: "Best for printing and sharing",
    icon: FileText,
    extension: ".pdf",
    popular: true,
  },
  {
    id: "epub",
    name: "EPUB",
    description: "Perfect for e-readers",
    icon: Book,
    extension: ".epub",
  },
  {
    id: "docx",
    name: "DOCX",
    description: "Editable Word document",
    icon: FileDown,
    extension: ".docx",
  },
];

interface ExportOptionsProps {
  bookTitle: string;
  uploadedFile?: File | null;
  rawHtml?: string;
}

export function ExportOptions({ bookTitle, uploadedFile, rawHtml }: ExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (selectedFormat === "docx") {
        if (!uploadedFile) {
          throw new Error("No DOCX file available");
        }

        // Download original file
        const url = URL.createObjectURL(uploadedFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = uploadedFile.name || `${bookTitle}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Complete! 🎉",
          description: "Your DOCX file has been downloaded.",
        });
      } else if (selectedFormat === "pdf") {
        if (!rawHtml) {
          throw new Error("No content available for PDF generation");
        }

        // Create a temporary container for PDF generation
        const element = document.createElement("div");
        element.innerHTML = `
          <div style="padding: 40px; font-family: serif; line-height: 1.6;">
            <h1 style="text-align: center; margin-bottom: 40px;">${bookTitle}</h1>
            ${rawHtml}
          </div>
        `;

        // Apply basic styling to ensure images look good in PDF
        const images = element.querySelectorAll("img");
        images.forEach(img => {
          img.style.maxWidth = "100%";
          img.style.height = "auto";
        });

        const opt = {
          margin: 10,
          filename: `${bookTitle}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        await html2pdf().set(opt).from(element).save();

        toast({
          title: "Export Complete! 🎉",
          description: "Your PDF has been generated and downloaded.",
        });
      } else if (selectedFormat === "epub") {
        toast({
          title: "Coming Soon 🚧",
          description: "EPUB export is currently under development. Please try PDF or DOCX.",
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
          Export Your Book
        </h2>
        <p className="text-muted-foreground">
          Choose your preferred format to download
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {formats.map((format) => (
          <motion.button
            key={format.id}
            onClick={() => setSelectedFormat(format.id)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative p-6 rounded-xl border-2 transition-all duration-300 text-left",
              selectedFormat === format.id
                ? "border-primary bg-primary/5 shadow-card"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            {format.popular && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gold text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Popular
              </span>
            )}

            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  selectedFormat === format.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-chapter"
                )}
              >
                <format.icon className="w-6 h-6" />
              </div>
              {selectedFormat === format.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </div>

            <h3 className="font-semibold text-foreground mb-1">
              {format.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {format.description}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {bookTitle}
              {format.extension}
            </p>
          </motion.button>
        ))}
      </div>

      <Button
        variant="hero"
        size="xl"
        className="w-full"
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Export as {formats.find((f) => f.id === selectedFormat)?.name}
          </span>
        )}
      </Button>
    </div>
  );
}
