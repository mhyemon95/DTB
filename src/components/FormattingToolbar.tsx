import { motion } from "framer-motion";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormattingToolbarProps {
    onFormat: (command: string, value?: string) => void;
}

export function FormattingToolbar({ onFormat }: FormattingToolbarProps) {
    const tools = [
        { icon: Bold, command: "bold", label: "Bold" },
        { icon: Italic, command: "italic", label: "Italic" },
        { icon: Underline, command: "underline", label: "Underline" },
        { type: "separator" },
        { icon: AlignLeft, command: "justifyLeft", label: "Align Left" },
        { icon: AlignCenter, command: "justifyCenter", label: "Align Center" },
        { icon: AlignRight, command: "justifyRight", label: "Align Right" },
        { type: "separator" },
        { icon: List, command: "insertUnorderedList", label: "Bullet List" },
        { icon: ListOrdered, command: "insertOrderedList", label: "Numbered List" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-border p-1 flex items-center gap-1"
        >
            {tools.map((tool, index) => {
                if (tool.type === "separator") {
                    return <div key={index} className="w-px h-6 bg-border mx-1" />;
                }

                const Icon = tool.icon as React.ElementType;

                return (
                    <Button
                        key={tool.command}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 hover:bg-muted"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFormat(tool.command as string);
                        }}
                        title={tool.label}
                    >
                        <Icon className="w-4 h-4" />
                    </Button>
                );
            })}
        </motion.div>
    );
}
