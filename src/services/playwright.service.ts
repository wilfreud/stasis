import { chromium } from "playwright";
import type { Browser, Page, BrowserContext } from "playwright";
import type { PDFOptions } from "src/types/index.js";

class BrowserManagerService {
  private browser: Browser | null = null;

  public async initBrowser() {
    if (this.browser) return;

    this.browser = await chromium.launch({
      headless: true, // Set to false if you want to see the browser UI
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
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
    console.debug("💭 Creating a new browser context...");
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
  ): Promise<Buffer> {
    console.log("Rendering page with HTML content...");
    let page: Page | undefined;
    try {
      page = await this.createPage();
      if (!page) throw new Error("Failed to create a new page");

      await page.setContent(html);

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
