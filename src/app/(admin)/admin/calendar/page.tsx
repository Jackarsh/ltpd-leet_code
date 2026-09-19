import { assertAdmin } from "@/server/auth/rbac";
import {
  getAllAcademicPeriods,
  getCurrentPeriods,
  getAllBranches,
} from "@/server/services/calendar.service";
import { CalendarManager } from "@/components/admin/CalendarManager";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Academic Calendar & Branches | CodeRank Admin",
  description: "Configure academic branches and semester boundaries for time-filtered leaderboards.",
};

export default async function AdminCalendarPage() {
  await assertAdmin();

  const [periods, current, branches] = await Promise.all([
    getAllAcademicPeriods(),
    getCurrentPeriods(),
    getAllBranches(true),
  ]);

  const serializedPeriods = periods.map((p) => ({
    id: p.id,
    name: p.name,
    periodType: p.periodType as "SEMESTER" | "ACADEMIC_YEAR",
    startDate: p.startDate.toISOString(),
    endDate: p.endDate.toISOString(),
    isCurrent: p.isCurrent,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const serializedBranches = branches.map((b) => ({
    id: b.id,
    name: b.name,
    code: b.code,
    isActive: b.isActive,
    displayOrder: b.displayOrder,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  const serializedCurrentSemester = current.currentSemester
    ? {
        ...current.currentSemester,
        periodType: current.currentSemester.periodType as "SEMESTER" | "ACADEMIC_YEAR",
        startDate: current.currentSemester.startDate.toISOString(),
        endDate: current.currentSemester.endDate.toISOString(),
        createdAt: current.currentSemester.createdAt.toISOString(),
        updatedAt: current.currentSemester.updatedAt.toISOString(),
      }
    : null;

  const serializedCurrentYear = current.currentYear
    ? {
        ...current.currentYear,
        periodType: current.currentYear.periodType as "SEMESTER" | "ACADEMIC_YEAR",
        startDate: current.currentYear.startDate.toISOString(),
        endDate: current.currentYear.endDate.toISOString(),
        createdAt: current.currentYear.createdAt.toISOString(),
        updatedAt: current.currentYear.updatedAt.toISOString(),
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Calendar className="h-4 w-4" />
          <span>Institutional Scheduling & Department Hierarchy</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Academic Calendar & Branches
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Configure academic departments and define semester date boundaries that drive time-filtered collegiate leaderboards.
        </p>
      </div>

      <CalendarManager
        initialPeriods={serializedPeriods}
        initialBranches={serializedBranches}
        initialCurrentSemester={serializedCurrentSemester}
        initialCurrentYear={serializedCurrentYear}
      />
    </div>
  );
}
