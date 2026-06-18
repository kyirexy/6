'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, CheckSquare, Target, CalendarDays, Trash2 } from 'lucide-react';
import { listPlans, getPlan, deletePlan } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { PlanData, PlanDay } from '@/lib/types';
import { getPlanCurrentDay, getPlanProgress, getTodayTasks } from '@/lib/types';
import PlanCard from '@/components/PlanCard';
import PlanTaskList from '@/components/PlanTaskList';
import PlanDynamicField from '@/components/PlanDynamicField';

function PlansContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');
  return planId ? <PlanDetail id={planId} /> : <PlanList />;
}

/* ------------------------------------------------------------------ */
/* List view                                                          */
/* ------------------------------------------------------------------ */

function PlanList() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = (p: number) => {
    setLoading(true);
    listPlans(p).then((res) => {
      if (res.success && res.data) {
        setPlans(res.data.items);
        setTotalPages(res.data.total_pages);
        setPage(res.data.page);
      }
      setLoading(false);
    });
  };

  useEffect(() => { load(1); }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-foreground tracking-tight">
          📋 我的计划
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          AI 从计划类视频中自动提取的任务清单
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-foreground-secondary mb-2 text-sm">暂无计划</p>
          <p className="text-foreground-muted text-xs mb-4">
            提取计划类视频后，系统会自动生成计划
          </p>
          <Link href="/" className="text-accent-emerald hover:underline text-sm">
            ← 返回首页提取视频
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => load(Math.max(1, page - 1))}
            disabled={page === 1}
            className="glass-input px-4 py-2 text-sm disabled:opacity-30 min-w-[44px] min-h-[44px]"
          >
            上一页
          </button>
          <span className="text-sm text-foreground-muted px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => load(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="glass-input px-4 py-2 text-sm disabled:opacity-30 min-w-[44px] min-h-[44px]"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Detail view                                                        */
/* ------------------------------------------------------------------ */

function PlanDetail({ id }: { id: string }) {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getPlan(id).then((res) => {
      if (res.success && res.data) {
        setPlan(res.data);
      } else {
        setError(res.error || '加载失败');
      }
      setLoading(false);
    });
  }, [id]);

  const handleMutate = (days: PlanDay[]) => {
    if (plan) setPlan({ ...plan, days });
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个计划吗？此操作不可撤销。')) return;
    setDeleting(true);
    const res = await deletePlan(id);
    if (res.success) {
      router.push('/plans');
    } else {
      alert('删除失败: ' + (res.error || '未知错误'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-16" />
        <div className="skeleton h-64" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-foreground-secondary mb-4">{error || '计划不存在'}</p>
        <Link href="/plans" className="text-accent-emerald hover:underline text-sm">
          ← 返回计划列表
        </Link>
      </div>
    );
  }

  const progress = getPlanProgress(plan);
  const currentDay = getPlanCurrentDay(plan);
  const todayTasks = getTodayTasks(plan);
  const days = plan.days || [];

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/plans"
          className="inline-flex items-center gap-1.5 text-foreground-secondary hover:text-foreground transition-colors text-sm px-3 py-2.5 rounded-lg hover:bg-white/5 min-h-[44px]">
          <ArrowLeft size={14} />返回计划列表
        </Link>
        <button type="button" onClick={handleDelete} disabled={deleting}
          className="inline-flex items-center gap-1.5 text-foreground-muted/40 hover:text-accent-rose hover:bg-accent-rose/10 transition-colors text-xs px-3 py-2 rounded-lg min-h-[36px]"
          aria-label="删除计划">
          <Trash2 size={13} />
          <span className="hidden sm:inline">{deleting ? '删除中...' : '删除'}</span>
        </button>
      </div>

      {/* Header with key metrics */}
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-foreground leading-snug text-balance">{plan.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1 text-sm text-foreground-muted">
            <CalendarDays size={14} className="text-accent-emerald" />
            第 {currentDay}/{plan.total_days || days.length || '?'} 天
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-foreground-muted">
            <CheckSquare size={14} className="text-accent-emerald" />
            {progress.done}/{progress.total} 项 · {progress.pct}%
          </span>
          {todayTasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-sm text-accent-emerald font-medium">
              <Calendar size={14} />{todayTasks.length} 项今日到期
            </span>
          )}
        </div>
      </div>

      {/* 2-column layout (desktop) */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <section className="flex-1 lg:flex-[2] min-w-0">
          <PlanTaskList planId={plan.id} days={days} currentDay={currentDay} onMutate={handleMutate} />
        </section>

        {/* Right: meta + dynamic fields (narrower sidebar on desktop) */}
        <aside className="lg:flex-[1] lg:min-w-[240px]">
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Status badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card-bg border border-card-border">
              <Target size={13} className="text-accent-emerald" />
              <span className="text-sm text-foreground-secondary">
                {plan.status === 'done' ? '已完成' : plan.status === 'draft' ? '草稿' : '进行中'}
              </span>
            </div>

            {/* Dynamic fields */}
            {plan.fields.length > 0 && (
              <div className="space-y-3">
                {plan.fields.map((f, i) => (
                  <PlanDynamicField key={i} field={f} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Note link */}
      {plan.note_id && (
        <div className="mt-8 pt-5 border-t border-card-border">
          <Link
            href={`/notes?id=${plan.note_id}`}
            className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground-secondary transition-colors"
          >
            查看原始笔记 →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page export — wrapped in Suspense for useSearchParams              */
/* ------------------------------------------------------------------ */

export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      }
    >
      <PlansContent />
    </Suspense>
  );
}
