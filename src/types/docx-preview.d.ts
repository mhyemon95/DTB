declare module "docx-preview" {
  export type RenderOptions = {
    inWrapper?: boolean;
    className?: string;
    ignoreFonts?: boolean;
    breakPages?: boolean;
    debug?: boolean;
    experimental?: boolean;
    useBase64URL?: boolean;
  };

  // Minimal signature to satisfy TS; the library provides a default export function
  export function renderAsync(
    file: ArrayBuffer | Blob,
    container: HTMLElement,
    style?: CSSStyleDeclaration | undefined,
    options?: RenderOptions
  ): Promise<void>;
}
