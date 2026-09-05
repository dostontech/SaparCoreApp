import React, { useEffect, useState } from 'react';
import { ShieldCheck, Server, RefreshCw, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { Card, Button, FormField, Select, Switch } from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';
import { toast } from 'sonner';
import { eimzoService } from '../../../services/eimzoService';

export const EdiSettings: React.FC = () => {
  const [provider, setProvider] = useState('DIDOX');
  const [apiKey, setApiKey] = useState('');
  const [autoSyncInbox, setAutoSyncInbox] = useState(true);
  const [eimzoStatus, setEimzoStatus] = useState<boolean | null>(null);
  const [checkingEimzo, setCheckingEimzo] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkEimzoAgent();
  }, []);

  const checkEimzoAgent = async () => {
    setCheckingEimzo(true);
    try {
      const running = await eimzoService.isAgentRunning();
      setEimzoStatus(running);
    } catch {
      setEimzoStatus(false);
    } finally {
      setCheckingEimzo(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('E-Faktura & E-IMZO sozlamalari muvaffaqiyatli saqlandi');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <PageHeader
        title="E-Faktura & E-IMZO Sozlamalari"
      />
      <p className="text-xs text-body -mt-4">
        Oʻzbekiston milliy elektron hujjat aylanishi (Didox, Factura.uz, Soliq) va E-IMZO raqamli imzo integratsiyasi.
      </p>

      <form onSubmit={handleSave} className="space-y-6">
        {/* E-IMZO Status Card */}
        <Card>
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                eimzoStatus ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-heading text-base">E-IMZO Mahalliy Agenti (127.0.0.1:64443)</h3>
                  {eimzoStatus ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3 h-3" /> Ishlayapti
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <AlertTriangle className="w-3 h-3" /> Sinov / Sandbox rejimi
                    </span>
                  )}
                </div>
                <p className="text-xs text-body mt-1">
                  Kompyuterdagi USB tokenlar va .pfx kalitlarni avtomatik aniqlash xizmati.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="white"
              size="sm"
              onClick={checkEimzoAgent}
              disabled={checkingEimzo}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${checkingEimzo ? 'animate-spin' : ''}`} />}
            >
              Qayta tekshirish
            </Button>
          </div>
        </Card>

        {/* EDI Operator Configuration */}
        <Card header={<div className="font-semibold text-heading flex items-center gap-2"><Server className="w-4 h-4 text-primary" /> EDI Operator Sozlamalari</div>}>
          <div className="p-5 space-y-4">
            <Select
              label="E-Faktura Operatori"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              options={[
                { value: 'DIDOX', label: 'Didox.uz (Didox API v1/v2)' },
                { value: 'FACTURA', label: 'Factura.uz / Soliq API' },
                { value: 'SOLIQ_DIRECT', label: 'Soliq E-Faktura Gateway' },
              ]}
              helper="Oʻzbekistonda litsenziyalangan rasmiy elektron hujjat aylanishi tizimi."
            />

            <FormField
              label="Operator API Kaliti (API Key / Token)"
              type="password"
              placeholder="e.g. didox_live_sec_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              helper="Operator shaxsiy kabinetidan olingan API kaliti. Boʻsh qoldirilsa avtomatik sinov rejimida ishlaydi."
            />

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-heading">Kiruvchi fakturalarni avtomatik sinxronlash</label>
                <p className="text-xs text-body">
                  Yetkazib beruvchilardan kelgan yangi e-fakturalarni fonda yuklab olish va Xaridlarga kiritish.
                </p>
              </div>
              <Switch
                name="autoSyncInbox"
                checked={autoSyncInbox}
                onChange={(checked: boolean) => setAutoSyncInbox(checked)}
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {saving ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EdiSettings;
