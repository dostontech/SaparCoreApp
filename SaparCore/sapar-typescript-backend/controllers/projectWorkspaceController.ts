/**
 * controllers/projectWorkspaceController.ts
 *
 * 📁 Project Management Workspace, Task Kanban & Profitability P&L
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

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  stage: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedToName: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
}

function formatTask(task: any): ProjectTask {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description || undefined,
    stage: task.stage as ProjectTask['stage'],
    priority: task.priority as ProjectTask['priority'],
    assignedToName: task.assignedToName || 'Xodim',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
    estimatedHours: Number(task.estimatedHours || 8),
    actualHours: Number(task.actualHours || 0),
  };
}

async function ensureDefaultTasks(userId: string, projectId: string): Promise<ProjectTask[]> {
  const existing = await prisma.projectTask.findMany({
    where: { userId, projectId },
    orderBy: { createdAt: 'desc' },
  });

  if (existing.length > 0) {
    return existing.map(formatTask);
  }

  const defaultTasks = [
    {
      userId,
      projectId,
      title: 'Tizim arxitekturasi va talablarini tasdiqlash',
      description: 'Mijoz texnik topshirigʻini toʻliq koʻrib chiqish',
      stage: 'DONE',
      priority: 'HIGH',
      assignedToName: 'Sardor Raximov',
      dueDate: new Date('2026-08-15'),
      estimatedHours: 20,
      actualHours: 18,
    },
    {
      userId,
      projectId,
      title: 'Server infratuzilmasi va maʼlumotlar bazasini sozlash',
      description: 'PostgreSQL klasteri va zaxira nusxalashni sozlash',
      stage: 'IN_PROGRESS',
      priority: 'URGENT',
      assignedToName: 'Nodir Karimov',
      dueDate: new Date('2026-08-25'),
      estimatedHours: 40,
      actualHours: 28,
    },
    {
      userId,
      projectId,
      title: 'Ombor va POS terminallari integratsiyasi',
      description: 'Shtrix-kod skanerlari va kassa apparatlarini ulash',
      stage: 'TODO',
      priority: 'MEDIUM',
      assignedToName: 'Nodir Karimov',
      dueDate: new Date('2026-09-05'),
      estimatedHours: 35,
      actualHours: 0,
    },
    {
      userId,
      projectId,
      title: 'Xodimlar uchun trening va yoʻriqnoma oʻtkazish',
      description: 'Buxgalteriya va savdo boʻlimini oʻqitish',
      stage: 'TODO',
      priority: 'LOW',
      assignedToName: 'Sardor Raximov',
      dueDate: new Date('2026-09-12'),
      estimatedHours: 15,
      actualHours: 0,
    },
  ];

  for (const t of defaultTasks) {
    await prisma.projectTask.create({ data: t });
  }

  const seeded = await prisma.projectTask.findMany({
    where: { userId, projectId },
    orderBy: { createdAt: 'desc' },
  });

  return seeded.map(formatTask);
}

export async function getProjectWorkspace(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const rawProjectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const projectId = rawProjectId || 'proj-main';

    const tasks = await ensureDefaultTasks(userId, projectId);

    // Project Profitability calculation
    const budget = 120000000;
    const billedRevenue = 95000000;
    const materialExpenses = 28000000;
    const laborCosts = 18500000;
    const totalCosts = materialExpenses + laborCosts;
    const netProfit = billedRevenue - totalCosts;
    const profitMargin = Math.round((netProfit / billedRevenue) * 100);

    res.json({
      success: true,
      data: {
        projectId,
        projectName: 'Toshkent Mega Zavodini Avtomatlashtirish',
        clientName: 'OASIS TEXTILE TRADING MCHJ',
        status: 'Jarayonda (In Progress)',
        deadline: '2026-09-30',
        tasks,
        financials: {
          budget,
          billedRevenue,
          materialExpenses,
          laborCosts,
          totalCosts,
          netProfit,
          profitMargin,
        },
      },
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('getProjectWorkspace error:', err);
    res.status(500).json({ success: false, message: 'Loyiha maʼlumotlarini yuklashda xatolik' });
  }
}

export async function createProjectTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const rawProjectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const projectId = rawProjectId || 'proj-main';
    const { title, description, stage = 'TODO', priority = 'MEDIUM', assignedToName = 'Xodim', dueDate, estimatedHours = 8 } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Vazifa nomi kiritilishi shart' });
      return;
    }

    const created = await prisma.projectTask.create({
      data: {
        userId,
        projectId,
        title,
        description: description || null,
        stage,
        priority,
        assignedToName,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000),
        estimatedHours: Number(estimatedHours || 8),
        actualHours: 0,
      },
    });

    res.status(201).json({ success: true, message: 'Vazifa yaratildi', data: formatTask(created) });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('createProjectTask error:', err);
    res.status(500).json({ success: false, message: 'Vazifa yaratishda xatolik' });
  }
}

export async function updateProjectTaskStage(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const rawProjectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const projectId = rawProjectId || 'proj-main';
    const rawTaskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
    const taskId = rawTaskId || '';
    const { stage } = req.body;

    const task = await prisma.projectTask.findFirst({
      where: { id: taskId, userId, projectId },
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Vazifa topilmadi' });
      return;
    }

    const updated = await prisma.projectTask.update({
      where: { id: task.id },
      data: { stage },
    });

    res.json({ success: true, message: 'Vazifa bosqichi yangilandi', data: formatTask(updated) });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('updateProjectTaskStage error:', err);
    res.status(500).json({ success: false, message: 'Vazifani yangilashda xatolik' });
  }
}

export async function deleteProjectTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const rawProjectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const projectId = rawProjectId || 'proj-main';
    const rawTaskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
    const taskId = rawTaskId || '';

    await prisma.projectTask.deleteMany({
      where: { id: taskId, userId, projectId },
    });

    res.json({ success: true, message: 'Vazifa oʻchirildi' });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('deleteProjectTask error:', err);
    res.status(500).json({ success: false, message: 'Vazifani oʻchirishda xatolik' });
  }
}
