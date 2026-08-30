/**
 * controllers/helpdeskController.ts
 *
 * 🎧 Customer Support & Helpdesk Ticketing Controller
 * Persisted in PostgreSQL via Prisma ORM.
 */

import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireUserId, UnauthorizedError } from '../lib/tenantScope';

function handleUnauthorized(res: Response, err: unknown): boolean {
  if (err instanceof UnauthorizedError) {
    res.status(err.status).json({ success: false, message: err.message });
    return true;
  }
  return false;
}

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NEW' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'RESOLVED';
  slaHours: number;
  assignedAgentName: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

function formatTicket(t: any): SupportTicket {
  return {
    id: t.id,
    userId: t.userId,
    ticketNumber: t.ticketNumber,
    subject: t.subject,
    customerName: t.customerName,
    customerEmail: t.customerEmail,
    customerPhone: t.customerPhone || undefined,
    priority: t.priority as SupportTicket['priority'],
    status: t.status as SupportTicket['status'],
    slaHours: t.slaHours || 8,
    assignedAgentName: t.assignedAgentName || 'Sardor Raximov',
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : new Date(t.createdAt).toISOString(),
    updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : new Date(t.updatedAt).toISOString(),
    messages: (t.messages || []).map((m: any) => ({
      id: m.id,
      senderName: m.senderName,
      senderRole: m.senderRole,
      message: m.message,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : new Date(m.createdAt).toISOString(),
    })),
  };
}

async function ensureDefaultTickets(userId: string): Promise<SupportTicket[]> {
  const existing = await prisma.supportTicket.findMany({
    where: { userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  if (existing.length > 0) {
    return existing.map(formatTicket);
  }

  // Seed default demo tickets
  await prisma.supportTicket.create({
    data: {
      userId,
      ticketNumber: 'SUP-2026-081',
      subject: 'E-Faktura orqali hisob-faktura yuborishda xatolik',
      customerName: 'OASIS TEXTILE TRADING MCHJ',
      customerEmail: 'info@oasis.uz',
      customerPhone: '+998 90 123-45-67',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      slaHours: 4,
      assignedAgentName: 'Sardor Raximov',
      messages: {
        create: [
          {
            senderName: 'Aziz Qodirov (Mijoz)',
            senderRole: 'CUSTOMER',
            message: 'Assalomu alaykum, Didox orqali imzolashda sertifikat muddati xatosi chiqyapti.',
            createdAt: new Date(Date.now() - 2 * 3600000),
          },
          {
            senderName: 'Sardor Raximov (SAPAR Support)',
            senderRole: 'AGENT',
            message: 'Assalomu alaykum! E-IMZO brauzer modulini 64443 portda yangilashingizni tavsiya qilamiz.',
            createdAt: new Date(Date.now() - 1 * 3600000),
          },
        ],
      },
    },
  });

  await prisma.supportTicket.create({
    data: {
      userId,
      ticketNumber: 'SUP-2026-082',
      subject: 'Bank koʻchirmasi avtomatik tushmadi',
      customerName: 'SAMARQAND LOGISTIKA SERVIS XK',
      customerEmail: 'sam@logistika.uz',
      customerPhone: '+998 93 555-88-22',
      priority: 'MEDIUM',
      status: 'NEW',
      slaHours: 8,
      assignedAgentName: 'Nodir Karimov',
      messages: {
        create: [
          {
            senderName: 'Rustam Saidov (Mijoz)',
            senderRole: 'CUSTOMER',
            message: 'Ipak Yoʻli Bankidan toʻlov qildik, tizimda qachon koʻrinadi?',
            createdAt: new Date(Date.now() - 30 * 60000),
          },
        ],
      },
    },
  });

  const seeded = await prisma.supportTicket.findMany({
    where: { userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return seeded.map(formatTicket);
}

export async function listTickets(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const tickets = await ensureDefaultTickets(userId);
    res.json({ success: true, data: tickets });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('listTickets error:', err);
    res.status(500).json({ success: false, message: 'Murojaatlarni yuklashda xatolik' });
  }
}

export async function createTicket(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { subject, customerName, customerEmail, customerPhone, priority = 'MEDIUM', initialMessage } = req.body;

    if (!subject || !customerName) {
      res.status(400).json({ success: false, message: 'Mavzu va mijoz nomi kiritilishi shart' });
      return;
    }

    const ticketNumber = `SUP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const slaHours = priority === 'URGENT' ? 2 : priority === 'HIGH' ? 4 : 8;

    const created = await prisma.supportTicket.create({
      data: {
        userId,
        ticketNumber,
        subject,
        customerName,
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || null,
        priority,
        status: 'NEW',
        slaHours,
        assignedAgentName: 'Sardor Raximov',
        messages: initialMessage
          ? {
              create: [
                {
                  senderName: customerName,
                  senderRole: 'CUSTOMER',
                  message: initialMessage,
                },
              ],
            }
          : undefined,
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    res.status(201).json({ success: true, message: 'Murojaat yaratildi', data: formatTicket(created) });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('createTicket error:', err);
    res.status(500).json({ success: false, message: 'Murojaat yaratishda xatolik' });
  }
}

export async function replyToTicket(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const ticketId = (Array.isArray(req.params.ticketId) ? req.params.ticketId[0] : req.params.ticketId) as string;
    const { message, senderName = 'Support Agent', role = 'AGENT' } = req.body;

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Murojaat topilmadi' });
      return;
    }

    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderName,
        senderRole: role,
        message,
      },
    });

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: role === 'AGENT' ? 'WAITING_CLIENT' : 'IN_PROGRESS',
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    res.json({ success: true, message: 'Javob yuborildi', data: formatTicket(updated) });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('replyToTicket error:', err);
    res.status(500).json({ success: false, message: 'Javob yuborishda xatolik' });
  }
}

export async function updateTicketStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const ticketId = (Array.isArray(req.params.ticketId) ? req.params.ticketId[0] : req.params.ticketId) as string;
    const { status } = req.body;

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Murojaat topilmadi' });
      return;
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    res.json({ success: true, message: 'Status yangilandi', data: formatTicket(updated) });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('updateTicketStatus error:', err);
    res.status(500).json({ success: false, message: 'Statusni yangilashda xatolik' });
  }
}
