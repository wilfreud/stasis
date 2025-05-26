import { chromium } from "playwright";
import type { Browser } from "playwright";

class BrowserManager {
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

  public async createPage() {
    const browserInstance = await this.getBrowser();
    return await browserInstance?.newPage();
  }
}

export default BrowserManager;
