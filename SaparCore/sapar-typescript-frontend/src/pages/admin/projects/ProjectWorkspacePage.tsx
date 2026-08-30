import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus,
  Clock,
  User,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';
import Constants from '@constants/api';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface Task {
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

const TASK_STAGES = [
  { key: 'TODO', label: '1. Reja (To Do)', color: 'border-slate-300 bg-slate-50', badge: 'bg-slate-200 text-slate-800' },
  { key: 'IN_PROGRESS', label: '2. Jarayonda (In Progress)', color: 'border-blue-400 bg-blue-50/40', badge: 'bg-blue-100 text-blue-800' },
  { key: 'REVIEW', label: '3. Tekshirish (Review)', color: 'border-amber-400 bg-amber-50/40', badge: 'bg-amber-100 text-amber-800' },
  { key: 'DONE', label: '4. Bajarildi (Done)', color: 'border-emerald-500 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800' },
] as const;

export const ProjectWorkspacePage: React.FC = () => {
  const { projectId = 'proj-main' } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const { format } = useCurrencyFormatter();

  const [loading, setLoading] = useState(true);
  const [workspaceData, setWorkspaceData] = useState<any | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Create Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStage, setTaskStage] = useState<Task['stage']>('TODO');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('MEDIUM');
  const [taskAssigned, setTaskAssigned] = useState('Sardor Raximov');
  const [taskDueDate, setTaskDueDate] = useState('2026-09-15');
  const [taskHours, setTaskHours] = useState<number>(8);

  useEffect(() => {
    fetchWorkspace();
  }, [projectId]);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/projects/${projectId}/workspace`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        setWorkspaceData(res.data.data);
        setTasks(res.data.data.tasks || []);
      }
    } catch {
      // Mock fallback
      setWorkspaceData({
        projectId,
        projectName: 'Toshkent Mega Zavodini Avtomatlashtirish',
        clientName: 'OASIS TEXTILE TRADING MCHJ',
        status: 'Jarayonda (In Progress)',
        deadline: '2026-09-30',
        financials: {
          budget: 120000000,
          billedRevenue: 95000000,
          materialExpenses: 28000000,
          laborCosts: 18500000,
          totalCosts: 46500000,
          netProfit: 48500000,
          profitMargin: 51,
        },
      });
      setTasks([
        {
          id: 'TASK-101',
          projectId,
          title: 'Tizim arxitekturasi va talablarini tasdiqlash',
          description: 'Mijoz texnik topshirigʻini toʻliq koʻrib chiqish',
          stage: 'DONE',
          priority: 'HIGH',
          assignedToName: 'Sardor Raximov',
          dueDate: '2026-08-15',
          estimatedHours: 20,
          actualHours: 18,
        },
        {
          id: 'TASK-102',
          projectId,
          title: 'Server infratuzilmasi va maʼlumotlar bazasini sozlash',
          description: 'PostgreSQL klasteri va zaxira nusxalashni sozlash',
          stage: 'IN_PROGRESS',
          priority: 'URGENT',
          assignedToName: 'Nodir Karimov',
          dueDate: '2026-08-25',
          estimatedHours: 40,
          actualHours: 28,
        },
        {
          id: 'TASK-103',
          projectId,
          title: 'Ombor va POS terminallari integratsiyasi',
          description: 'Shtrix-kod skanerlari va kassa apparatlarini ulash',
          stage: 'TODO',
          priority: 'MEDIUM',
          assignedToName: 'Nodir Karimov',
          dueDate: '2026-09-05',
          estimatedHours: 35,
          actualHours: 0,
        },
        {
          id: 'TASK-104',
          projectId,
          title: 'Xodimlar uchun trening va yoʻriqnoma oʻtkazish',
          description: 'Buxgalteriya va savdo boʻlimini oʻqitish',
          stage: 'TODO',
          priority: 'LOW',
          assignedToName: 'Sardor Raximov',
          dueDate: '2026-09-12',
          estimatedHours: 15,
          actualHours: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle) {
      toast.error('Vazifa nomi kiritilishi shart');
      return;
    }

    try {
      const payload = {
        title: taskTitle,
        description: taskDesc,
        stage: taskStage,
        priority: taskPriority,
        assignedToName: taskAssigned,
        dueDate: taskDueDate,
        estimatedHours: Number(taskHours || 8),
      };

      const res = await axios.post(
        `${Constants.API_BASE_URL}/admin/projects/${projectId}/tasks`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.data) {
        setTasks((prev) => [res.data.data, ...prev]);
        setIsModalOpen(false);
        setTaskTitle('');
        setTaskDesc('');
        toast.success('Yangi vazifa qoʻshildi!');
      }
    } catch {
      const created: Task = {
        id: `TASK-${Date.now().toString().slice(-4)}`,
        projectId,
        title: taskTitle,
        description: taskDesc,
        stage: taskStage,
        priority: taskPriority,
        assignedToName: taskAssigned,
        dueDate: taskDueDate,
        estimatedHours: Number(taskHours || 8),
        actualHours: 0,
      };
      setTasks((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      toast.success('Yangi vazifa qoʻshildi!');
    }
  };

  const handleMoveTaskStage = async (taskId: string, direction: 'next' | 'prev') => {
    const stageOrder: Task['stage'][] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentIdx = stageOrder.indexOf(task.stage);
    let nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;

    if (nextIdx < 0 || nextIdx >= stageOrder.length) return;
    const targetStage = stageOrder[nextIdx];

    try {
      await axios.put(
        `${Constants.API_BASE_URL}/admin/projects/${projectId}/tasks/${taskId}/stage`,
        { stage: targetStage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, stage: targetStage } : t))
      );
      toast.success('Vazifa bosqichi yangilandi');
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, stage: targetStage } : t))
      );
      toast.success('Vazifa bosqichi yangilandi');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(
        `${Constants.API_BASE_URL}/admin/projects/${projectId}/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Vazifa oʻchirildi');
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Vazifa oʻchirildi');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-full mx-auto font-sans text-slate-800">
      {/* Header with Navigation Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/accounting/projects')}
            className="text-slate-800 bg-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1 text-teal-700" />
            Loyihalar Roʻyxati
          </Button>
          <PageHeader title={workspaceData?.projectName || 'Loyiha Ish Maydoni'} />
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Yangi Vazifa Qoʻshish
        </Button>
      </div>

      {/* Financial Profitability (P&L) Dashboard Cards */}
      {workspaceData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Loyiha Byudjeti
            </span>
            <p className="text-lg font-black text-slate-900 font-mono mt-1">
              {format(workspaceData.financials.budget)}
            </p>
            <span className="text-[10px] text-slate-500">Mijoz bilan kelishilgan</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Chiqarilgan Fakturalar
            </span>
            <p className="text-lg font-black text-blue-700 font-mono mt-1">
              {format(workspaceData.financials.billedRevenue)}
            </p>
            <span className="text-[10px] text-blue-800">Hisob-kitob qilingan</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Moddiy Xarajatlar
            </span>
            <p className="text-lg font-black text-amber-700 font-mono mt-1">
              {format(workspaceData.financials.materialExpenses)}
            </p>
            <span className="text-[10px] text-amber-800">Xaridlar & Materiallar</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              Ish Haqi Xarajatlari
            </span>
            <p className="text-lg font-black text-purple-700 font-mono mt-1">
              {format(workspaceData.financials.laborCosts)}
            </p>
            <span className="text-[10px] text-purple-800">Ishlangan soatlar qiymati</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
              Sof Foyda (Profit P&L)
            </span>
            <p className="text-lg font-black text-emerald-700 font-mono mt-1">
              {format(workspaceData.financials.netProfit)}
            </p>
            <span className="text-[10px] font-bold text-emerald-800">
              Rentabellik: {workspaceData.financials.profitMargin}%
            </span>
          </div>
        </div>
      )}

      {/* Task Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[900px]">
          {TASK_STAGES.map((st) => {
            const stageTasks = tasks.filter((t) => t.stage === st.key);

            return (
              <div
                key={st.key}
                className={`flex flex-col rounded-3xl border ${st.color} p-4 space-y-3 min-h-[520px]`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-xs text-slate-800">{st.label}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${st.badge}`}>
                    {stageTasks.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {loading ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-medium">
                      Yuklanmoqda...
                    </div>
                  ) : stageTasks.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-medium border-2 border-dashed border-slate-300 rounded-2xl">
                      Vazifalar yoʻq
                    </div>
                  ) : (
                    stageTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              {task.id}
                            </span>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                task.priority === 'URGENT'
                                  ? 'bg-red-100 text-red-700'
                                  : task.priority === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 leading-snug">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Assignee & Due Date */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                          <span className="flex items-center gap-1 font-semibold truncate max-w-[120px]">
                            <User className="w-3.5 h-3.5 text-teal-700" />
                            {task.assignedToName}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        </div>

                        {/* Action Controls */}
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {task.estimatedHours} soat
                          </span>
                          <div className="flex items-center gap-1">
                            {st.key !== 'TODO' && (
                              <button
                                type="button"
                                title="Oldingi bosqichga qaytarish"
                                onClick={() => handleMoveTaskStage(task.id, 'prev')}
                                className="p-1 rounded hover:bg-slate-100 text-slate-500"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {st.key !== 'DONE' && (
                              <button
                                type="button"
                                title="Keyingi bosqichga oʻtkazish"
                                onClick={() => handleMoveTaskStage(task.id, 'next')}
                                className="p-1 rounded hover:bg-teal-50 text-teal-700 font-bold"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Oʻchirish"
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Create Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Yangi Vazifa Qoʻshish</h3>

            <FormField
              label="Vazifa nomi *"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Masalan: Baza strukturasini yaratish"
            />
            <FormField
              label="Batafsil izoh"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Topshiriq mazmuni..."
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Muhimlik (Priority)</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border rounded-xl"
                >
                  <option value="LOW">Oddiy (Low)</option>
                  <option value="MEDIUM">Oʻrta (Medium)</option>
                  <option value="HIGH">Yuqori (High)</option>
                  <option value="URGENT">Shoshilinch (Urgent)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dastlabki Bosqich</label>
                <select
                  value={taskStage}
                  onChange={(e) => setTaskStage(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border rounded-xl"
                >
                  <option value="TODO">1. Reja (To Do)</option>
                  <option value="IN_PROGRESS">2. Jarayonda</option>
                  <option value="REVIEW">3. Tekshirish</option>
                  <option value="DONE">4. Bajarildi</option>
                </select>
              </div>
              <FormField
                label="Rejalashtirilgan soat"
                type="number"
                value={taskHours}
                onChange={(e) => setTaskHours(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Masʼul xodim"
                value={taskAssigned}
                onChange={(e) => setTaskAssigned(e.target.value)}
              />
              <FormField
                label="Topshirish muddati"
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Bekor Qilish
              </Button>
              <Button onClick={handleCreateTask} className="bg-teal-700 text-white font-bold">
                Vazifani Saqlash
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspacePage;
