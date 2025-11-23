export interface EmailTemplateOptions {
    title: string;
    content: string;
    footerText?: string;
    logoUrl?: string;
    frontendBaseUrl?: string;
}
export declare class EmailTemplate {
    private static readonly BRAND_COLORS;
    static generateHTML(options: EmailTemplateOptions): string;
    static generateText(title: string, content: string, footerText?: string): string;
    static createCodeBox(code: string): string;
    static createMessageBox(senderName: string, senderEmail: string, message: string): string;
    static createButton(text: string, url: string): string;
}
