/**
 * controllers/tabelController.ts
 *
 * 🇺🇿 Uzbekistan Employee Monthly Working Hours & Attendance Sheet (Tabel / Табель)
 *
 * Conforms to Uzbekistan Labor Code (Mehnat Kodeksi, 40-hour work week).
 * Attendance status codes:
 *   - I (Ishda / 8 soat)
 *   - D (Dam olish / Bayram)
 *   - T (Yillik mehnat taʼtili)
 *   - K (Kasallik varaqasi / Vaqtincha mehnatga layoqatsizlik)
 *   - X (Ish haqi saqlanmagan taʼtil)
 *   - S (Xizmat safari / Komandirovka)
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

// In-memory / JSON-backed persistent store for monthly tabel matrices per tenant
// Stored per tenantId_year_month
const tabelStore: Record<string, any> = {};

export async function getTabelMatrix(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const now = new Date();
    const year = Number(req.query.year || now.getFullYear());
    const month = Number(req.query.month || now.getMonth() + 1); // 1-12

    const daysInMonth = new Date(year, month, 0).getDate();

    // Fetch all active employees in workspace
    const employees = await prisma.user.findMany({
      where: {
        isDeleted: false,
        OR: [{ id: userId }, { ownerId: userId }],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        user_type: true,
      },
      orderBy: { firstName: 'asc' },
    });

    const storeKey = `${userId}_${year}_${month}`;
    const existingMatrix = tabelStore[storeKey] || {};

    const daysList: Array<{
      day: number;
      date: string;
      dayOfWeek: number;
      dayName: string;
      isWeekend: boolean;
      defaultCode: string;
      defaultHours: number;
    }> = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      daysList.push({
        day,
        date: date.toISOString().substring(0, 10),
        dayOfWeek,
        dayName: ['Ya', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha'][dayOfWeek],
        isWeekend,
        defaultCode: isWeekend ? 'D' : 'I',
        defaultHours: isWeekend ? 0 : 8,
      });
    }

    const employeeRows = employees.map((emp) => {
      const savedEmpData = existingMatrix[emp.id] || {};
      const attendance = daysList.map((d) => {
        const savedDay = savedEmpData.attendance?.[d.day - 1];
        return {
          day: d.day,
          code: savedDay?.code || d.defaultCode,
          hours: savedDay !== undefined ? savedDay.hours : d.defaultHours,
          isWeekend: d.isWeekend,
        };
      });

      // Calculate totals
      let totalWorkedDays = 0;
      let totalWorkedHours = 0;
      let totalVacationDays = 0;
      let totalSickDays = 0;
      let totalUnpaidDays = 0;

      for (const a of attendance) {
        if (a.code === 'I' || a.code === 'S') {
          totalWorkedDays++;
          totalWorkedHours += a.hours;
        } else if (a.code === 'T') {
          totalVacationDays++;
        } else if (a.code === 'K') {
          totalSickDays++;
        } else if (a.code === 'X') {
          totalUnpaidDays++;
        }
      }

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
        position: emp.user_type === 1 ? 'Rahbar / Direktor' : 'Xodim / Mutaxassis',
        attendance,
        totals: {
          totalWorkedDays,
          totalWorkedHours,
          totalVacationDays,
          totalSickDays,
          totalUnpaidDays,
        },
      };
    });

    res.json({
      success: true,
      data: {
        year,
        month,
        daysInMonth,
        daysList,
        employeeRows,
      },
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('getTabelMatrix error:', err);
    res.status(500).json({ success: false, message: 'Tabel yuklashda xatolik yuz berdi' });
  }
}

export async function saveTabelMatrix(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { year, month, employeeRows } = req.body as {
      year: number;
      month: number;
      employeeRows: any[];
    };

    if (!year || !month || !employeeRows) {
      res.status(400).json({ success: false, message: 'Yil, oy va tabel qatorlari talab qilinadi' });
      return;
    }

    const storeKey = `${userId}_${year}_${month}`;
    const matrixToSave: Record<string, any> = {};

    for (const row of employeeRows) {
      matrixToSave[row.employeeId] = {
        attendance: row.attendance,
        totals: row.totals,
      };
    }

    tabelStore[storeKey] = matrixToSave;

    res.json({
      success: true,
      message: `${year}-yil ${month}-oy uchun tabel muvaffaqiyatli saqlandi`,
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('saveTabelMatrix error:', err);
    res.status(500).json({ success: false, message: 'Tabelni saqlashda xatolik yuz berdi' });
  }
}
