/**
 * Auto-generated product code/barcode helpers.
 * Uzbekistan GS1 Standard EAN-13 & SKU Generators
 */

export function generateProductCode(): string {
    return `PROD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

export function generateRandomBarcode(): string {
    return generateEan13Barcode();
}

/**
 * Generates a standard GS1 EAN-13 barcode with Uzbekistan national prefix 478
 * and mathematically computed Modulo-10 check digit.
 */
export function generateEan13Barcode(): string {
    const prefix = '478';
    let body = prefix;
    for (let i = 0; i < 9; i++) {
        body += Math.floor(Math.random() * 10).toString();
    }
    // Calculate EAN-13 checksum (modulo 10 with alternating weights 1 and 3)
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(body[i], 10);
        sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checksum = (10 - (sum % 10)) % 10;
    return body + checksum.toString();
}
