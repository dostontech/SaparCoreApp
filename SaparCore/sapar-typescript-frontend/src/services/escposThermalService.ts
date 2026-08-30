/**
 * src/services/escposThermalService.ts
 *
 * Direct ESC/POS thermal printing engine for 58mm and 80mm POS receipt printers.
 * Supports WebUSB, Web Bluetooth, and silent iframe printing with Soliq QR Code.
 */

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  ikpu?: string;
  packageCode?: string;
  vatRate?: number;
}

export interface ReceiptData {
  receiptId: string;
  createdAt: string | Date;
  company?: {
    name?: string;
    tin?: string;
    address?: string;
    phone?: string;
  };
  cashierName?: string;
  customerName?: string;
  items: ReceiptItem[];
  subtotal: number;
  discountAmount?: number;
  vatAmount?: number;
  total: number;
  payments?: {
    method?: string;
    cash?: number;
    uzcard?: number;
    humo?: number;
    qr?: number;
    debt?: number;
  };
  fiscalSign?: string;
  qrUrl?: string;
}

export class EscposThermalService {
  /**
   * Generates ESC/POS binary command buffer for 58mm (32 chars) or 80mm (48 chars).
   */
  public static generateEscposBuffer(data: ReceiptData, width: 58 | 80 = 80): Uint8Array {
    const charsPerLine = width === 58 ? 32 : 48;
    const encoder = new TextEncoder();
    const commands: number[] = [];

    // Initialize Printer
    commands.push(0x1b, 0x40); // ESC @

    // Alignment: Center
    commands.push(0x1b, 0x61, 0x01); // ESC a 1

    // Double Height / Bold for Store Title
    commands.push(0x1b, 0x45, 0x01); // ESC E 1 (Bold ON)
    commands.push(0x1b, 0x21, 0x10); // Double height
    this.addText(commands, encoder, `${data.company?.name || 'SAPAR RETAIL'}\n`);

    // Reset font size
    commands.push(0x1b, 0x21, 0x00);
    commands.push(0x1b, 0x45, 0x00); // Bold OFF

    if (data.company?.address) {
      this.addText(commands, encoder, `${data.company.address}\n`);
    }
    if (data.company?.tin) {
      this.addText(commands, encoder, `STIR (INN): ${data.company.tin}\n`);
    }

    this.addText(commands, encoder, `CHEK № ${data.receiptId}\n`);
    this.addText(commands, encoder, `Sana: ${new Date(data.createdAt).toLocaleString('uz-UZ')}\n`);
    if (data.cashierName) {
      this.addText(commands, encoder, `Kassir: ${data.cashierName}\n`);
    }

    // Divider Line
    this.addText(commands, encoder, '-'.repeat(charsPerLine) + '\n');

    // Alignment: Left
    commands.push(0x1b, 0x61, 0x00); // ESC a 0

    // Table Header
    commands.push(0x1b, 0x45, 0x01); // Bold ON
    const colHeader = this.formatTwoColumns('NOMI / MIQDOR', 'SUMMA', charsPerLine);
    this.addText(commands, encoder, colHeader + '\n');
    commands.push(0x1b, 0x45, 0x00); // Bold OFF

    // Items
    for (const it of data.items) {
      this.addText(commands, encoder, `${it.name}\n`);
      if (it.ikpu) {
        this.addText(commands, encoder, ` MXIK: ${it.ikpu}\n`);
      }
      const qtyPrice = ` ${it.quantity} x ${it.price.toLocaleString('uz-UZ')}`;
      const lineTotal = (it.quantity * it.price).toLocaleString('uz-UZ');
      const itemLine = this.formatTwoColumns(qtyPrice, lineTotal, charsPerLine);
      this.addText(commands, encoder, itemLine + '\n');
    }

    // Divider Line
    this.addText(commands, encoder, '-'.repeat(charsPerLine) + '\n');

    // Totals
    this.addText(commands, encoder, this.formatTwoColumns('Oraliq jami:', data.subtotal.toLocaleString('uz-UZ'), charsPerLine) + '\n');

    if (data.discountAmount && data.discountAmount > 0) {
      this.addText(commands, encoder, this.formatTwoColumns('Chegirma:', `-${data.discountAmount.toLocaleString('uz-UZ')}`, charsPerLine) + '\n');
    }

    if (data.vatAmount) {
      this.addText(commands, encoder, this.formatTwoColumns('QQS (12% ichida):', data.vatAmount.toLocaleString('uz-UZ'), charsPerLine) + '\n');
    }

    // Grand Total Bold
    commands.push(0x1b, 0x45, 0x01); // Bold ON
    commands.push(0x1b, 0x21, 0x10); // Double height
    this.addText(commands, encoder, this.formatTwoColumns('JAMI:', `${data.total.toLocaleString('uz-UZ')} UZS`, charsPerLine) + '\n');
    commands.push(0x1b, 0x21, 0x00); // Standard font
    commands.push(0x1b, 0x45, 0x00); // Bold OFF

    this.addText(commands, encoder, '-'.repeat(charsPerLine) + '\n');

    // Payment Breakdowns
    if (data.payments) {
      this.addText(commands, encoder, `To'lov usuli: ${data.payments.method || 'Aralash'}\n`);
      if (data.payments.cash) this.addText(commands, encoder, `  Naqd: ${data.payments.cash.toLocaleString('uz-UZ')} UZS\n`);
      if (data.payments.uzcard) this.addText(commands, encoder, `  Uzcard: ${data.payments.uzcard.toLocaleString('uz-UZ')} UZS\n`);
      if (data.payments.humo) this.addText(commands, encoder, `  Humo: ${data.payments.humo.toLocaleString('uz-UZ')} UZS\n`);
      if (data.payments.qr) this.addText(commands, encoder, `  Payme/Click: ${data.payments.qr.toLocaleString('uz-UZ')} UZS\n`);
      if (data.payments.debt) this.addText(commands, encoder, `  Nasiya: ${data.payments.debt.toLocaleString('uz-UZ')} UZS\n`);
    }

    // Soliq Fiscal Info
    commands.push(0x1b, 0x61, 0x01); // Center
    this.addText(commands, encoder, '\n=== SOLIQ FISKAL MA\'LUMOTI ===\n');
    this.addText(commands, encoder, `FPU / FM: ${data.fiscalSign || 'FP98741024'}\n`);
    this.addText(commands, encoder, 'Xaridingiz uchun rahmat!\n\n');

    // Feed and Cut
    commands.push(0x1b, 0x64, 0x04); // Feed 4 lines
    commands.push(0x1d, 0x56, 0x42, 0x00); // GS V 66 0 (Full Paper Cut)

    return new Uint8Array(commands);
  }

  /**
   * WebUSB Direct Thermal Printing (1-Click, No Dialog)
   */
  public static async printWebUSB(data: ReceiptData, width: 58 | 80 = 80): Promise<{ success: boolean; message: string }> {
    if (!('usb' in navigator)) {
      return { success: false, message: 'WebUSB brauzeringizda qoʻllab-quvvatlanmaydi' };
    }
    try {
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      const buffer = this.generateEscposBuffer(data, width);
      const outEndpoint = device.configuration.interfaces[0].alternate.endpoints.find(
        (e: any) => e.direction === 'out'
      );
      const endpointNumber = outEndpoint ? outEndpoint.endpointNumber : 1;

      await device.transferOut(endpointNumber, buffer);
      await device.close();
      return { success: true, message: 'Chek WebUSB orqali printerga muvaffaqiyatli yuborildi' };
    } catch (err: any) {
      return { success: false, message: err.message || 'WebUSB printerga ulanishda xatolik' };
    }
  }

  /**
   * Web Bluetooth Direct Thermal Printing
   */
  public static async printBluetooth(data: ReceiptData, width: 58 | 80 = 80): Promise<{ success: boolean; message: string }> {
    if (!('bluetooth' in navigator)) {
      return { success: false, message: 'Web Bluetooth brauzeringizda qoʻllab-quvvatlanmaydi' };
    }
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2'],
      });
      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();
      if (services.length === 0) throw new Error('Bluetooth xizmati topilmadi');

      const service = services[0];
      const characteristics = await service.getCharacteristics();
      const writeChar = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);

      if (!writeChar) throw new Error('Yozish kanali topilmadi');

      const buffer = this.generateEscposBuffer(data, width);
      // Send in 100-byte chunks
      const chunkSize = 100;
      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, i + chunkSize);
        await writeChar.writeValue(chunk);
      }

      return { success: true, message: 'Chek Bluetooth printerga muvaffaqiyatli yuborildi' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Bluetooth printerga ulanishda xatolik' };
    }
  }

  /**
   * Helper to format two left and right justified text columns on thermal paper.
   */
  private static formatTwoColumns(left: string, right: string, totalWidth: number): string {
    const leftTrim = left.slice(0, totalWidth - right.length - 1);
    const spaceCount = Math.max(1, totalWidth - leftTrim.length - right.length);
    return leftTrim + ' '.repeat(spaceCount) + right;
  }

  private static addText(commands: number[], encoder: TextEncoder, text: string): void {
    const bytes = encoder.encode(text);
    for (let i = 0; i < bytes.length; i++) {
      commands.push(bytes[i]);
    }
  }
}
