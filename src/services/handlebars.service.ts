import Handlebars from "handlebars";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const { compile, registerHelper } = Handlebars;

export class HandlebarsService {
  constructor() {
    // this.registerHelpers();
  }

  private registerHelpers(): void {
    console.log("Registering Handlebars helper: capitalize");
    registerHelper("capitalize", function (str: string) {
      if (typeof str !== "string") {
        return "";
      }
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    console.log("Registering Handlebars helper: lowercase");
    registerHelper("lowercase", function (str: string) {
      if (typeof str !== "string") {
        return "";
      }
      return str.toLowerCase();
    });

    console.log("Registering Handlebars helper: uppercase");
    registerHelper("uppercase", function (str: string) {
      if (typeof str !== "string") {
        return "";
      }
      return str.toUpperCase();
    });

    console.log("Registering Handlebars helper: formatDate");
    registerHelper("formatDate", function (date: string, dateFormat: string) {
      return format(date, dateFormat, { locale: fr });
    });

    console.log("Registering Handlebars helper: gt");
    registerHelper("gt", function (a: number, b: number) {
      return a > b;
    });

    console.log("Registering Handlebars helper: or");
    registerHelper("or", function (a: any, b: any) {
      return a || b;
    });
  }

  public compileTemplate(template: string, data: Record<string, any>): string {
    const compiledTemplate = compile(template, {
      strict: true,
      noEscape: false,
    });
    return compiledTemplate(data);
  }
}
