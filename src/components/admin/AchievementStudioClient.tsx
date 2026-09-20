"use client";

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Medal,
  Flame,
  Star,
  Zap,
  Code,
  Target,
  Award,
  Crown,
  Shield,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Archive,
  Edit2,
  X,
} from "lucide-react";
import {
  AchievementBuilderForm,
  AchievementInitialData,
} from "./AchievementBuilderForm";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  medal: Medal,
  flame: Flame,
  star: Star,
  zap: Zap,
  code: Code,
  target: Target,
  award: Award,
  crown: Crown,
  shield: Shield,
};

const RARITY_STYLES: Record<string, { badge: string; text: string; bg: string }> = {
  COMMON: {
    badge: "bg-slate-800 text-slate-300 border-slate-700",
    text: "text-slate-400",
    bg: "bg-slate-900/50 border-slate-800",
  },
  RARE: {
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    text: "text-blue-400",
    bg: "bg-blue-950/10 border-blue-900/30",
  },
  EPIC: {
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    text: "text-purple-400",
    bg: "bg-purple-950/10 border-purple-900/30",
  },
  LEGENDARY: {
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    text: "text-amber-400",
    bg: "bg-amber-950/10 border-amber-900/30",
  },
};

export interface AchievementItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  iconKey: string;
  conditionExpression: string;
  rarityLevel: string;
  points: number;
  status: string;
  recipientCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AchievementStudioClientProps {
  initialAchievements: AchievementItem[];
}

export function AchievementStudioClient({
  initialAchievements,
}: AchievementStudioClientProps) {
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AchievementInitialData | undefined>(undefined);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Compute summary metrics
  const stats = useMemo(() => {
    const total = achievements.length;
    const published = achievements.filter((a) => a.status === "PUBLISHED").length;
    const drafts = achievements.filter((a) => a.status === "DRAFT").length;
    const archived = achievements.filter((a) => a.status === "ARCHIVED").length;
    const totalAwarded = achievements.reduce((acc, a) => acc + (a.recipientCount || 0), 0);
    return { total, published, drafts, archived, totalAwarded };
  }, [achievements]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    achievements.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [achievements]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchSlug = item.slug.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchSlug) return false;
      }
      return true;
    });
  }, [achievements, statusFilter, categoryFilter, searchQuery]);

  const refreshData = async () => {
    try {
      const res = await fetch("/api/admin/achievements");
      const data = await res.json();
      if (data.success && Array.isArray(data.achievements)) {
        setAchievements(data.achievements);
      }
    } catch (err) {
      console.error("Failed to refresh achievements:", err);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AchievementItem) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      iconKey: item.iconKey,
      conditionExpression: item.conditionExpression,
      rarityLevel: item.rarityLevel as any,
      points: item.points,
      status: item.status as any,
    });
    setIsModalOpen(true);
  };

  const handleArchive = async (id: string) => {
    setArchivingId(id);
    try {
      const res = await fetch("/api/admin/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ARCHIVE", id }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error("Failed to archive achievement:", err);
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Total Badges</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{stats.total}</p>
          <span className="text-[11px] text-slate-500">Configured in platform</span>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Published</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{stats.published}</p>
          <span className="text-[11px] text-emerald-500/70">Actively evaluating</span>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Drafts</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-300">{stats.drafts}</p>
          <span className="text-[11px] text-amber-500/70">Not visible to students</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Archive className="w-4 h-4" />
            <span>Archived</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-300">{stats.archived}</p>
          <span className="text-[11px] text-slate-500">Recipients grandfathered</span>
        </div>

        <div className="col-span-2 lg:col-span-1 rounded-xl border border-purple-900/40 bg-purple-950/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Total Awarded</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-300">{stats.totalAwarded}</p>
          <span className="text-[11px] text-purple-500/70">Student badge unlocks</span>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 border border-slate-800 p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, description, or slug..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/80"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/80"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Create Button */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Achievement</span>
        </button>
      </div>

      {/* Achievement List Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
        {filteredAchievements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="font-medium text-slate-300">No achievements found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search filter or click &quot;Create Achievement&quot; to define a new badge.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Badge</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unlock Condition</th>
                  <th className="py-3 px-4">Rarity & Weight</th>
                  <th className="py-3 px-4 text-center">Recipients</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAchievements.map((item) => {
                  const IconComp = ICON_MAP[item.iconKey] || Trophy;
                  const rarityStyle =
                    RARITY_STYLES[item.rarityLevel] || RARITY_STYLES.COMMON;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Badge Name & Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${rarityStyle.badge}`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              <span>{item.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[10px] font-medium uppercase tracking-wider">
                          {item.category.replace("_", " ")}
                        </span>
                      </td>

                      {/* Unlock Condition */}
                      <td className="py-3.5 px-4">
                        <code className="bg-slate-950/70 px-2 py-1 rounded border border-slate-800 text-[11px] font-mono text-amber-300/90 max-w-sm block truncate">
                          {item.conditionExpression}
                        </code>
                      </td>

                      {/* Rarity & Points */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${rarityStyle.badge}`}
                          >
                            {item.rarityLevel}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.points} pts
                          </span>
                        </div>
                      </td>

                      {/* Recipients */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{item.recipientCount}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            item.status === "PUBLISHED"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : item.status === "ARCHIVED"
                              ? "bg-slate-800 text-slate-400 border border-slate-700"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Achievement"
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {item.status !== "ARCHIVED" && (
                            <button
                              type="button"
                              onClick={() => handleArchive(item.id)}
                              disabled={archivingId === item.id}
                              title="Archive Achievement (Grandfathers existing recipients)"
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>
                    {editingItem ? "Edit Achievement Definition" : "Create New Achievement"}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure programmatic badge rules and visual assets without modifying code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AchievementBuilderForm
              initialData={editingItem}
              onSuccess={async () => {
                setIsModalOpen(false);
                await refreshData();
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
