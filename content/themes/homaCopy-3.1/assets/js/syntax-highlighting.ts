/*
  Syntax Highlighting
  -----------------
  Code syntax highlighting using Prism.js.
  Supports multiple programming languages.
*/

const HIGHLIGHT_STYLES_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css';
const HIGHLIGHT_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';

type WindowWithSyntaxHighlighting = Window & {
  hljs?: { highlightBlock: (block: Element) => void }
};

export class SyntaxHighlighting {
  static SELECTOR = 'pre code';
  private codeBlocks: NodeListOf<Element>;

  constructor() {
    this.codeBlocks = document.querySelectorAll(SyntaxHighlighting.SELECTOR);
    
    if (this.codeBlocks.length > 0) {
      this.init();
    }
  }

  private init(): void {
    document.addEventListener('DOMContentLoaded', () => {
      this.loadStyles();
      this.loadScript();
    });
  }

  private loadStyles(): void {
    const highlightStyles = document.createElement('link');
    highlightStyles.rel = 'stylesheet';
    highlightStyles.href = HIGHLIGHT_STYLES_URL;
    document.head.appendChild(highlightStyles);
  }

  private loadScript(): void {
    const highlightScript = document.createElement('script');
    highlightScript.src = HIGHLIGHT_SCRIPT_URL;
    document.body.appendChild(highlightScript);

    highlightScript.onload = () => {
      this.highlightCodeBlocks();
    };
  }

  private highlightCodeBlocks(): void {
    this.codeBlocks.forEach((block) => {
      (window as WindowWithSyntaxHighlighting).hljs?.highlightBlock(block);
    });
  }
}