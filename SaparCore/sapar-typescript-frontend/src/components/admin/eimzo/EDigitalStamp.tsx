import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface EDigitalSignatureInfo {
  signedBy: string;
  tin: string;
  pinfl?: string;
  organization?: string;
  role?: string;
  serialNumber: string;
  signedAt: string;
  pkcs7Signature: string;
  isValid: boolean;
}

interface EDigitalStampProps {
  signature?: EDigitalSignatureInfo | null;
  roleTitle?: string;
  isSigned?: boolean;
}

export const EDigitalStamp: React.FC<EDigitalStampProps> = ({
  signature,
  roleTitle = 'Joʻnatuvchi',
  isSigned = true,
}) => {
  if (!isSigned || !signature) {
    return (
      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center bg-muted/20 min-h-[140px] flex flex-col items-center justify-center">
        <ShieldCheck className="w-8 h-8 text-body/30 mb-1" />
        <p className="text-xs font-semibold text-body/60 uppercase tracking-wider">{roleTitle}</p>
        <p className="text-xs text-body/50 mt-0.5">E-IMZO bilan imzolanmagan</p>
      </div>
    );
  }

  return (
    <div className="relative border-2 border-teal-600/80 rounded-xl p-3.5 bg-gradient-to-br from-teal-50/90 to-emerald-50/90 text-teal-950 shadow-xs max-w-sm w-full font-sans select-none overflow-hidden">
      {/* Decorative Emblem / Background Watermark */}
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
        <ShieldCheck className="w-32 h-32 text-teal-900" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-teal-600/30 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span className="text-[11px] font-bold tracking-tight text-teal-900 uppercase">
            ELEKTRON RAQAMLI IMZO
          </span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" /> TASDIQLANGAN
        </span>
      </div>

      {/* Signer Data */}
      <div className="space-y-1 text-[11px] leading-tight">
        <div>
          <span className="text-teal-800/70 text-[10px] block font-medium">{roleTitle}:</span>
          <span className="font-bold text-teal-950 block">{signature.signedBy}</span>
        </div>

        {signature.organization && (
          <p className="text-[10px] text-teal-900/90 truncate font-medium">
            {signature.organization} {signature.role ? `• ${signature.role}` : ''}
          </p>
        )}

        <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] text-teal-900/80 border-t border-teal-600/20">
          <div>
            <span className="text-teal-700/70 block">STIR:</span>
            <span className="font-mono font-bold text-teal-950">{signature.tin}</span>
          </div>
          {signature.pinfl && (
            <div>
              <span className="text-teal-700/70 block">PINFL:</span>
              <span className="font-mono font-bold text-teal-950">{signature.pinfl}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 text-[9px] text-teal-800/70">
          <span>S/N: {signature.serialNumber}</span>
          <span>{signature.signedAt}</span>
        </div>
      </div>
    </div>
  );
};
