import Handlebars from "handlebars";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { readFileSync } from "fs";
import { resolve } from "path";

export class HandlebarsService {
  constructor() {
    this.registerHelpers();
  }

  private registerHelpers(shouldLog: boolean = false): void {
    const log = (message: string) => {
      if (shouldLog) {
        console.log(message);
      }
    };

    log("Registering Handlebars helper: capitalize");
    Handlebars.registerHelper("capitalize", function (str: string) {
      if (typeof str !== "string") {
        return "";
      }
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    log("Registering Handlebars helper: lowercase");
    Handlebars.registerHelper("lowercase", function (str: string) {
      if (typeof str !== "string") {
        return "";
      }
      return str.toLowerCase();
    });

    log("Registering Handlebars helper: uppercase");
    Handlebars.registerHelper("uppercase", function (str: string) {
      if (typeof str !== "string") {
        return "";
      }
      return str.toUpperCase();
    });

    log("Registering Handlebars helper: formatDate");
    Handlebars.registerHelper(
      "formatDate",
      function (date: string, dateFormat: string) {
        return format(date, dateFormat, { locale: fr });
      },
    );

    log("Registering Handlebars helper: gt");
    Handlebars.registerHelper("gt", function (a: number, b: number) {
      return a > b;
    });

    log("Registering Handlebars helper: or");
    Handlebars.registerHelper("or", function (a: any, b: any) {
      return a || b;
    });

    log("Registering Handlebars helper: currentDate");
    Handlebars.registerHelper("currentDate", function (format: string) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      if (format === "YYYY-MM-DD") {
        return `${year}-${month}-${day}`;
      } else if (format === "DD/MM/YYYY") {
        return `${day}/${month}/${year}`;
      }
      return `${day}/${month}/${year}`;
    });
  }

  public compileTemplate(template: string, data: Record<string, any>): string {
    const compiledTemplate = Handlebars.compile(template, {
      strict: true,
      noEscape: false,
    });
    return compiledTemplate(data);
  }

  public compileTemplateWithCSS(
    template: string,
    data: Record<string, any>,
    cssPath?: string,
  ): string {
    let processedTemplate = template;

    // If CSS path is provided, inline the CSS
    if (cssPath) {
      try {
        const cssContent = readFileSync(resolve(cssPath), "utf-8");
        // Replace CSS link with inline styles
        processedTemplate = template.replace(
          /<link rel="stylesheet" href="[^"]*">/g,
          `<style>${cssContent}</style>`,
        );
      } catch (error) {
        console.warn(`Warning: Could not read CSS file at ${cssPath}:`, error);
      }
    }

    const compiledTemplate = Handlebars.compile(processedTemplate, {
      strict: true,
      noEscape: false,
    });
    return compiledTemplate(data);
  }
}
