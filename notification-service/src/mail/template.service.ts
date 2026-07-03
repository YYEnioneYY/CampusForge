import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private readonly compiledTemplates = new Map<string, Handlebars.TemplateDelegate>();

  async render(templateName: string, context: Record<string, unknown>): Promise<string> {
    const template = await this.getCompiledTemplate(templateName);

    return template(context);
  }

  private async getCompiledTemplate(
    templateName: string,
  ): Promise<Handlebars.TemplateDelegate> {
    const cachedTemplate = this.compiledTemplates.get(templateName);

    if (cachedTemplate) {
      return cachedTemplate;
    }

    const templatePath = path.join(
      process.cwd(),
      'src',
      'email-notification',
      'templates',
      `${templateName}.hbs`,
    );

    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateSource);

    this.compiledTemplates.set(templateName, compiledTemplate);

    return compiledTemplate;
  }
}