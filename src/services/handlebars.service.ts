import Handlebars from "handlebars";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export class HandlebarsService {
  constructor() {
    this.registerHelpers();
  }

  private preCompiledTemplates: Record<string, Handlebars.TemplateDelegate> =
    {};

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

    log("Registering Handlebars helper: formatDate"); // ...existing code...
    Handlebars.registerHelper(
      "formatDate",
      function (date: string, dateFormat: string) {
        const parsed = typeof date === "string" ? parseISO(date) : date;
        if (!isValid(parsed)) return "";
        return format(parsed, dateFormat, { locale: fr });
      },
    );
    // ...existing code...

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

    // Helper modulo pour les lignes alternées
    log("Registering Handlebars helper: modulo");
    Handlebars.registerHelper("modulo", function (value: number, mod: number) {
      return value % mod;
    });

    // Helper eq pour comparer des valeurs
    log("Registering Handlebars helper: eq");
    Handlebars.registerHelper("eq", function (a: any, b: any) {
      return a === b;
    });

    // Helper and pour combiner des conditions
    log("Registering Handlebars helper: and");
    Handlebars.registerHelper("and", function () {
      for (let i = 0; i < arguments.length - 1; i++) {
        if (!arguments[i]) {
          return false;
        }
      }
      return true;
    });

    // Helper multiply pour calculer les montants
    log("Registering Handlebars helper: multiply");
    Handlebars.registerHelper("multiply", function (a: number, b: number) {
      return (a * b).toLocaleString();
    });

    // Helper join pour les tableaux
    log("Registering Handlebars helper: join");
    Handlebars.registerHelper(
      "join",
      function (array: any[], separator: string) {
        if (!Array.isArray(array)) return "";
        return array.join(separator);
      },
    );
  }

  public compileTemplate(
    template: string,
    data: Record<string, any>,
    id?: string,
  ): string {
    // add time benchmarking
    const start = process.hrtime();

    if (id && !this.preCompiledTemplates[id]) {
      console.debug(`⌛ Compiling Handlebars template with id: ${id}`);
      this.preCompiledTemplates[id] = Handlebars.compile(template, {
        // strict: true,
        noEscape: false,
      });
    }

    const compiledTemplate = id
      ? this.preCompiledTemplates[id]
      : Handlebars.compile(template, {
          // strict: true,
          noEscape: false,
        });

    // const compiledTemplate = Handlebars.compile(template, {
    //   // strict: true,
    //   noEscape: false,
    // });

    const end = process.hrtime(start);
    const [seconds, nanoseconds] = end;
    const timeInMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    const compiledOutput = compiledTemplate(data);
    console.debug(
      `⚒️ Compiled Handlebars template in ${timeInMs}ms (${parseInt(timeInMs) / 1000}s)`,
    );
    return compiledOutput;
  }
}
