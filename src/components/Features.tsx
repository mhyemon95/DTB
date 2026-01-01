import { motion } from "framer-motion";
import { Upload, Wand2, Download, BookOpen, Layers, FileCheck } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Simply drag and drop your DOCX file. We handle the rest.",
  },
  {
    icon: Wand2,
    title: "Smart Parsing",
    description: "Automatically detects chapters, headings, and formatting.",
  },
  {
    icon: Layers,
    title: "Structured Layout",
    description: "Content organized into proper book structure with TOC.",
  },
  {
    icon: BookOpen,
    title: "Live Preview",
    description: "See your book exactly as it will appear in the final format.",
  },
  {
    icon: FileCheck,
    title: "Quality Export",
    description: "Professional-grade PDF, EPUB, and DOCX output.",
  },
  {
    icon: Download,
    title: "Instant Download",
    description: "Get your formatted book in seconds, ready to publish.",
  },
];

export function Features() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From raw manuscript to polished publication in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-chapter group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
