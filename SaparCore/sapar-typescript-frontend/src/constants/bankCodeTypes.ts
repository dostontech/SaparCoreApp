// Regional bank-code formats for Uzbekistan and Central Asia.
// Stored in `IFSCCode` field in backend, rendered as MFO / МФО for national banks.
export interface BankCodeType {
    id: string;
    label: string;
    placeholder: string;
}

export const BANK_CODE_TYPES: BankCodeType[] = [
    { id: "MFO", label: "MFO (Bank Kodi — 5 xonali) / МФО", placeholder: "Masalan: 01036 yoki 00444" },
    { id: "SWIFT", label: "SWIFT / BIC (Xalqaro)", placeholder: "Masalan: IPBLUZ22" },
    { id: "IFSC", label: "MFO / BIK / IFSC", placeholder: "Bank kodi" },
    { id: "IBAN", label: "IBAN (Xalqaro)", placeholder: "Masalan: UZ..." },
    { id: "OTHER", label: "Boshqa Bank Kodi", placeholder: "Bank kodi kiriting" },
];

// Default to MFO for Uzbekistan accounts
export const getBankCodeType = (id?: string | null): BankCodeType =>
    BANK_CODE_TYPES.find((t) => t.id === id) ?? BANK_CODE_TYPES[0];

