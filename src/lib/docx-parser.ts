import mammoth from "mammoth";

export interface BookSection {
  id: string;
  title: string;
}

export interface BookChapter {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  sections: BookSection[];
}

export interface ParsedBook {
  title: string;
  chapters: BookChapter[];
  rawHtml: string;
}

export async function parseDocxFile(file: File): Promise<ParsedBook> {
  const arrayBuffer = await file.arrayBuffer();
  
  const result = await mammoth.convertToHtml({ arrayBuffer }, {
    convertImage: mammoth.images.imgElement(function(image) {
      return image.read("base64").then(function(imageBuffer) {
        return {
          src: "data:" + image.contentType + ";base64," + imageBuffer
        };
      });
    }),
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Title'] => h1.title:fresh",
      "b => strong",
      "i => em",
      "u => u",
    ],
    includeDefaultStyleMap: true,
    preserveEmptyParagraphs: false
  });

  const html = result.value;
  const processedHtml = processHtmlForFormatting(html);
  const chapters = extractChaptersFromHtml(processedHtml);
  
  // Extract title from filename or first heading
  const title = file.name.replace(/\.docx$/i, "");

  return {
    title,
    chapters,
    rawHtml: processedHtml,
  };
}

function processHtmlForFormatting(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const container = doc.body.firstChild as HTMLElement;
  
  // Find all elements with style attributes and preserve all formatting
  const elementsWithStyle = container.querySelectorAll('[style]');
  elementsWithStyle.forEach(element => {
    const style = element.getAttribute('style');
    if (style) {
      // Keep the original style attribute intact
      const cleanedStyle = style
        .replace(/;\s*$/, '') // Remove trailing semicolon
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .join('; ');
      
      if (cleanedStyle) {
        element.setAttribute('style', cleanedStyle);
      }
    }
  });
  
  return container.innerHTML;
}

function extractChaptersFromHtml(html: string): BookChapter[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const container = doc.body.firstChild as HTMLElement;
  
  const chapters: BookChapter[] = [];
  let currentChapter: BookChapter | null = null;
  let chapterIndex = 0;
  let sectionIndex = 0;
  let contentBuffer: string[] = [];
  let htmlBuffer: string[] = [];

  const flushContent = () => {
    if (currentChapter) {
      currentChapter.content = contentBuffer.join("\n\n");
      currentChapter.htmlContent = htmlBuffer.join("");
      chapters.push(currentChapter);
    }
    contentBuffer = [];
    htmlBuffer = [];
  };

  const children = container.childNodes;
  
  for (let i = 0; i < children.length; i++) {
    const node = children[i] as HTMLElement;
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      
      // H1 = New Chapter
      if (tagName === "h1") {
        flushContent();
        chapterIndex++;
        sectionIndex = 0;
        currentChapter = {
          id: `ch${chapterIndex}`,
          title: node.textContent?.trim() || `Chapter ${chapterIndex}`,
          content: "",
          htmlContent: "",
          sections: [],
        };
      }
      // H2 = Section within chapter
      else if (tagName === "h2" && currentChapter) {
        sectionIndex++;
        currentChapter.sections.push({
          id: `s${chapterIndex}-${sectionIndex}`,
          title: node.textContent?.trim() || `Section ${sectionIndex}`,
        });
        htmlBuffer.push(`<h2>${node.innerHTML}</h2>`);
      }
      // H3 = Subsection
      else if (tagName === "h3" && currentChapter) {
        htmlBuffer.push(`<h3>${node.innerHTML}</h3>`);
      }
      // Other content
      else if (currentChapter) {
        contentBuffer.push(node.textContent?.trim() || "");
        htmlBuffer.push(node.outerHTML);
      }
      // Content before first heading - create intro chapter
      else if (!currentChapter && node.textContent?.trim()) {
        chapterIndex++;
        currentChapter = {
          id: `ch${chapterIndex}`,
          title: "Introduction",
          content: "",
          htmlContent: "",
          sections: [],
        };
        contentBuffer.push(node.textContent?.trim() || "");
        htmlBuffer.push(node.outerHTML);
      }
    }
  }

  flushContent();

  // If no chapters were found, create a single chapter with all content
  if (chapters.length === 0) {
    chapters.push({
      id: "ch1",
      title: "Content",
      content: container.textContent?.trim() || "",
      htmlContent: html,
      sections: [],
    });
  }

  return chapters;
}
