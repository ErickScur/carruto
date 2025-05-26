export interface IQRCodeGenerator {
  generate(text: string): Promise<string>;
}
