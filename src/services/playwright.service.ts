import { chromium } from "playwright";
import type { Browser, Page, BrowserContext } from "playwright";
import type { PDFOptions, TemplateRenderOptions } from "../types/index.js";

class BrowserManagerService {
  private browser: Browser | null = null;
  // private readonly MAX_CONTEXTS = 10; // Maximum number of contexts to manage
  // private contexts: BrowserContext[] = [];
  // private lastUsedContextIndex = 0;

  public async initBrowser() {
    if (this.browser) return;

    this.browser = await chromium.launch({
      headless: true, // Set to false if you want to see the browser UI
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--disable-web-security",
      ],
    });

    // create initial contexts
    // for (let i = 0; i < this.MAX_CONTEXTS; i++) {
    //   const context = await this.browser.newContext();
    //   this.contexts.push(context);
    // }
  }

  public async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  public async getBrowser() {
    if (!this.browser) {
      await this.initBrowser();
    }
    return this.browser;
  }

  public async createContext() {
    const browserInstance = await this.getBrowser();
    return await browserInstance?.newContext();
  }

  public async closeContext(context: BrowserContext) {
    if (context) {
      await context.close();
    }
  }

  public async createPage(
    ignoreContextCreation: boolean = false,
  ): Promise<Page | undefined> {
    if (ignoreContextCreation) return (await this.getBrowser())?.newPage();

    const context = await this.createContext();
    return await context?.newPage();
  }

  public async renderPage(
    html: string,
    pdfOptions: PDFOptions = { format: "A4", printBackground: true },
    renderOptions: TemplateRenderOptions = {
      waitUntil: "load",
      useTailwindCss: false,
    },
  ): Promise<Buffer> {
    console.log(
      "⚡Rendering page with HTML content..." +
        (renderOptions.useTailwindCss ? " (with Tailwind CSS)" : ""),
    );
    let page: Page | undefined;
    try {
      page = await this.createPage();
      if (!page) throw new Error("Failed to create a new page");

      await page.setContent(html, renderOptions);

      if (renderOptions?.useTailwindCss) {
        await page.addScriptTag({
          url: "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
        });
      }

      await page.emulateMedia({ media: "print" }); // or 'screen' if that yields better results

      return await page.pdf(pdfOptions);
    } catch (error) {
      console.error("Failed to render page:", error);
      throw error;
    } finally {
      if (page) {
        await this.closeContext(page.context());
      }
    }
  }
}

export default BrowserManagerService;
