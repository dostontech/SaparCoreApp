import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  ChevronRight,
  Trash2,
  Edit,
  Download,
  Share2,
  Copy,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Plus,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  Tabs,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  SimpleTooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';

export const DesignSystemPage: React.FC = () => {
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const [isChecked, setIsChecked] = useState(true);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState('uzs');
  const [activeTab, setActiveTab] = useState('primitives');
  const [selectedCurrency, setSelectedCurrency] = useState('UZS');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Sparkles className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 font-sans tracking-tight">
              SAPAR Design System (Radix UI + Tailwind CSS)
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enterprise-grade, accessible component library built for Uzbekistan & Central Asia.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="soft" color="success">
            React 19 Compatible
          </Badge>
          <Badge variant="soft" color="indigo">
            Radix Primitives
          </Badge>
          <Badge variant="soft" color="purple">
            Tailwind v4
          </Badge>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        variant="segmented"
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { key: 'primitives', label: 'Core Primitives', icon: <Layers className="h-4 w-4" /> },
          { key: 'overlays', label: 'Dialogs & Overlays', icon: <Sliders className="h-4 w-4" /> },
          { key: 'forms', label: 'Inputs & Controls', icon: <CheckCircle2 className="h-4 w-4" /> },
        ]}
      />

      {/* TAB 1: CORE PRIMITIVES */}
      {activeTab === 'primitives' && (
        <div className="space-y-8">
          {/* Brand Colors Card */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Brand Palette (Uzbekistan & Central Asia)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg bg-[#028090] text-white">
                <p className="font-bold text-xs">Primary Teal</p>
                <p className="text-[10px] opacity-80">#028090</p>
              </div>
              <div className="p-3 rounded-lg bg-[#02C39A] text-gray-950">
                <p className="font-bold text-xs">Accent Mint</p>
                <p className="text-[10px] opacity-80">#02C39A</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0B2B33] text-white">
                <p className="font-bold text-xs">Dark Navy</p>
                <p className="text-[10px] opacity-80">#0B2B33</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F0FBF8] border border-purple-200 text-purple-900">
                <p className="font-bold text-xs">Soft Surface</p>
                <p className="text-[10px] opacity-80">#F0FBF8</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-600 text-white">
                <p className="font-bold text-xs">Success</p>
                <p className="text-[10px] opacity-80">#27AE60</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-600 text-white">
                <p className="font-bold text-xs">Danger</p>
                <p className="text-[10px] opacity-80">#EF1E1E</p>
              </div>
            </div>
          </Card>

          {/* Buttons Section */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Button Variants & Affordances</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="white">White</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="dangerOutline">Danger Outline</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link Style</Button>
              <Button variant="primary" isLoading>Loading</Button>
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                With Icon
              </Button>
            </div>
          </Card>

          {/* Badges Section */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Badges & Status Indicators</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge color="purple">UZS — Soʻm</Badge>
              <Badge color="info">USD — Dollar</Badge>
              <Badge color="success">Paid / Toʻlangan</Badge>
              <Badge color="warning">Pending / Kutilmoqda</Badge>
              <Badge color="danger">Overdue / Muddati oʻtgan</Badge>
              <Badge color="gray">Draft / Qoralama</Badge>
              <Badge variant="soft" color="purple">QQS 12%</Badge>
              <Badge variant="soft" color="success">E-IMZO Tasdiqlangan</Badge>
            </div>
          </Card>

          {/* Radix Accordion */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Radix Accordion</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What are the key tax standards in Uzbekistan?</AccordionTrigger>
                <AccordionContent>
                  Uzbekistan applies a 12% standard VAT (QQS), 12% Personal Income Tax (JShODS), 12% Social Tax, and a 4% Turnover Tax (Aylanmadan olinadigan soliq) for simplified regime entities.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does E-IMZO digital signature work in SAPAR?</AccordionTrigger>
                <AccordionContent>
                  SAPAR integrates with the native E-IMZO browser agent running on port 64443 to sign electronic invoices and acts of reconciliation using national PFX keys and hardware USB e-tokens.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      )}

      {/* TAB 2: OVERLAYS & FLOATING UI */}
      {activeTab === 'overlays' && (
        <div className="space-y-8">
          <Card className="p-6 space-y-6">
            <h3 className="text-base font-bold text-gray-900">Interactive Radix Overlays</h3>
            <div className="flex flex-wrap items-center gap-4">
              {/* Radix Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="primary">Open Radix Dialog</Button>
                </DialogTrigger>
                <DialogContent size="lg">
                  <DialogHeader>
                    <DialogTitle>Radix UI Dialog Window</DialogTitle>
                    <DialogDescription>
                      Full accessibility, focus-trapping, and backdrop blur.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody className="space-y-4">
                    <p className="text-sm text-gray-600">
                      This modal utilizes `@radix-ui/react-dialog` with smooth entrance animations and complete keyboard navigation.
                    </p>
                    <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-900">
                      <strong>Tip:</strong> Press <kbd className="px-1 py-0.5 bg-white border border-purple-200 rounded">Escape</kbd> to close.
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <Button variant="white" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => setIsDialogOpen(false)}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Radix Alert Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="danger">Open Alert Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Customer Record?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the selected customer profile and remove associated drafts.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="danger">Confirm Deletion</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Radix Sheet (Drawer) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Side Drawer (Sheet)</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Invoice Quick Details</SheetTitle>
                    <SheetDescription>
                      View and inspect line items, MXIK codes, and payments.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-4 text-sm text-gray-600 flex-1">
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                      <p className="text-xs text-gray-400">Invoice Number</p>
                      <p className="font-bold text-gray-800">INV-2026-0042</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                      <p className="text-xs text-gray-400">Total Amount</p>
                      <p className="font-bold text-purple-700 text-lg">14,250,000 UZS</p>
                    </div>
                  </div>
                  <SheetFooter>
                    <Button variant="primary" className="w-full">
                      Print Invoice
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* Radix Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="white">
                    Action Menu <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4" /> Edit Record
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4" /> Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4" /> Share Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="danger">
                    <Trash2 className="h-4 w-4" /> Cancel Invoice
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Radix Tooltip */}
              <SimpleTooltip content="Standard VAT rate in Uzbekistan is 12%">
                <Button variant="ghost" className="border border-gray-200">
                  <Info className="h-4 w-4 mr-1 text-purple-600" /> Hover for Tooltip
                </Button>
              </SimpleTooltip>

              {/* Radix Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="white">Open Filter Popover</Button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-80">
                  <h4 className="font-bold text-sm text-gray-900 mb-2">Filter Invoices</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Refine records by fiscal status and date range.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Only Fiscalized</span>
                      <Switch checked={isSwitchOn} onChange={setIsSwitchOn} />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: FORMS & CONTROLS */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Switches & Checkboxes */}
          <Card className="p-6 space-y-5">
            <h3 className="text-base font-bold text-gray-900">Switches & Toggles</h3>
            <div className="space-y-3">
              <div>
                <Switch
                  checked={isSwitchOn}
                  onChange={setIsSwitchOn}
                  label="Enable Didox / Soliq E-Faktura auto-sync"
                />
              </div>
              <div>
                <Switch
                  checked={false}
                  onChange={() => {}}
                  disabled
                  label="Auto-generate Cash register fiscal receipt (Disabled)"
                />
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
              Checkboxes
            </h3>
            <div className="space-y-3">
              <div>
                <Checkbox
                  checked={isChecked}
                  onChange={(c) => setIsChecked(c === true)}
                  label="Include 12% QQS in unit prices"
                />
              </div>
              <div>
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isIndeterminate}
                  onChange={() => setIsIndeterminate(!isIndeterminate)}
                  label="Select all 42 transaction items (Indeterminate)"
                />
              </div>
            </div>
          </Card>

          {/* Radio Groups & Select */}
          <Card className="p-6 space-y-5">
            <h3 className="text-base font-bold text-gray-900">Radix Radio Group</h3>
            <RadioGroup
              value={selectedRadio}
              onChange={setSelectedRadio}
              options={[
                { value: 'uzs', label: 'Oʻzbekiston soʻmi (UZS)' },
                { value: 'usd', label: 'US Dollar (USD)' },
                { value: 'kzt', label: 'Qazaqstan tengesi (KZT)' },
              ]}
            />

            <h3 className="text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
              Radix Select Dropdown
            </h3>
            <div className="w-full max-w-xs">
              <SelectRoot value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UZS">UZS — Soʻm</SelectItem>
                  <SelectItem value="USD">USD — Dollar</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="RUB">RUB — Rubl</SelectItem>
                  <SelectItem value="KZT">KZT — Tenge</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DesignSystemPage;
