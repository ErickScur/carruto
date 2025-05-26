import qrcode from "qrcode";
import { IQRCodeGenerator } from "../../domain/services/IQRCodeGenerator";

export class QRCodeGeneratorAdapter implements IQRCodeGenerator {
  async generate(text: string): Promise<string> {
    try {
      return await qrcode.toDataURL(text);
    } catch (err) {
      console.error("Error generating QR code:", err);
      throw new Error("Failed to generate QR code");
    }
  }
}
