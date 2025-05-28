import { describe, it, expect, vi } from "vitest";
import { HandlebarsService } from "./handlebars.service";

const hbsService = new HandlebarsService();

describe("renderTemplate", () => {
  it("should render a template with the given data", () => {
    const template = "<h1>Hello, {{name}}</h1>";
    const data = { name: "Commodore!" };
    const result = hbsService.compileTemplate(template, data);
    expect(result).toBe("<h1>Hello, Commodore!</h1>");
  });
});
