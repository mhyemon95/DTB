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
  jsonData: BookJSON;
}

export interface BookJSON {
  bookId: string;
  title: string;
  pageSize: {
    name: string;
    width: number;
    height: number;
    widthMm: number;
    heightMm: number;
  };
  globalSettings: {
    backgroundColor: string;
    backgroundImage: string;
    backgroundImageOpacity: number;
    backgroundImageSize: string;
    backgroundImagePosition: string;
    defaultFontFamily: string;
    defaultFontSize: string;
    defaultLineHeight: string;
    defaultTextColor: string;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    padding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    borderRadius: number;
    shadow: boolean;
    shadowColor: string;
    shadowOpacity: number;
    pageNumbering: {
      enabled: boolean;
      format: string;
      position: string;
      prefix: string;
      suffix: string;
      startFrom: number;
      fontSize: string;
    };
  };
  zoom: number;
  totalPages: number;
  createdAt: string;
  updatedAt: string;
  pages: Array<{
    id: string;
    title: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    elements: Array<{
      id: string;
      type: string;
      content: string;
      styles: Record<string, any>;
      position: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
  }>;
}

export async function parseDocxFile(file: File): Promise<ParsedBook> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Step 1: DOCX → HTML
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
  const title = file.name.replace(/\.docx$/i, "");
  
  // Step 2: HTML → JSON
  const jsonData = convertHtmlToJson(html, title);
  
  // Step 3: JSON → HTML → JavaScript Object
  const processedHtml = convertJsonToHtml(jsonData);
  const chapters = extractChaptersFromHtml(processedHtml);

  return {
    title,
    chapters,
    rawHtml: processedHtml,
    jsonData,
  };
}

function convertHtmlToJson(html: string, title: string): BookJSON {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const container = doc.body.firstChild as HTMLElement;
  
  const bookId = `book-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  
  const elements: any[] = [];
  let yPosition = 50;
  
  container.childNodes.forEach((node, index) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      
      elements.push({
        id: `element-${crypto.randomUUID()}`,
        type: tagName === 'h1' ? 'heading' : tagName === 'h2' ? 'subheading' : 'text',
        content: element.textContent || '',
        styles: {
          fontSize: tagName === 'h1' ? '24px' : tagName === 'h2' ? '20px' : '14px',
          fontWeight: tagName.startsWith('h') ? 'bold' : 'normal',
          color: '#333333',
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        position: {
          x: 48,
          y: yPosition,
          width: 698,
          height: tagName === 'h1' ? 40 : tagName === 'h2' ? 32 : 24
        }
      });
      
      yPosition += (tagName === 'h1' ? 60 : tagName === 'h2' ? 48 : 36);
    }
  });
  
  return {
    bookId,
    title,
    pageSize: {
      name: "A4",
      width: 794,
      height: 1123,
      widthMm: 210,
      heightMm: 297
    },
    globalSettings: {
      backgroundColor: "#ffffff",
      backgroundImage: "",
      backgroundImageOpacity: 1,
      backgroundImageSize: "cover",
      backgroundImagePosition: "center",
      defaultFontFamily: "Inter, system-ui, sans-serif",
      defaultFontSize: "14px",
      defaultLineHeight: "1.5",
      defaultTextColor: "#333333",
      margins: {
        top: 32,
        bottom: 32,
        left: 48,
        right: 48
      },
      padding: {
        top: 16,
        bottom: 16,
        left: 0,
        right: 0
      },
      borderRadius: 0,
      shadow: true,
      shadowColor: "#000000",
      shadowOpacity: 0.1,
      pageNumbering: {
        enabled: true,
        format: "english",
        position: "bottom-center",
        prefix: "— ",
        suffix: " —",
        startFrom: 1,
        fontSize: "14px"
      }
    },
    zoom: 1,
    totalPages: 1,
    createdAt: now,
    updatedAt: now,
    pages: [{
      id: `page-${crypto.randomUUID()}`,
      title: "Page 1",
      order: 0,
      createdAt: now,
      updatedAt: now,
      elements
    }]
  };
}

function convertJsonToHtml(jsonData: BookJSON): string {
  let html = '';
  
  jsonData.pages.forEach(page => {
    page.elements.forEach(element => {
      const tag = element.type === 'heading' ? 'h1' : element.type === 'subheading' ? 'h2' : 'p';
      const styles = Object.entries(element.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
      
      html += `<${tag} style="${styles}">${element.content}</${tag}>`;
    });
  });
  
  return html;
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
