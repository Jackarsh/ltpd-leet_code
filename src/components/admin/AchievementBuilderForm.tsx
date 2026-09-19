"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";
import {
  validateAchievementCondition,
  validateAchievementInput,
  WHITELIST_VARIABLES,
  WhitelistVariable,
  AllowedOperator,
} from "@/lib/achievement-validator";

const ICONS = [
  { key: "trophy", label: "Trophy", icon: Trophy },
  { key: "medal", label: "Medal", icon: Medal },
  { key: "flame", label: "Flame", icon: Flame },
  { key: "star", label: "Star", icon: Star },
  { key: "zap", label: "Zap", icon: Zap },
  { key: "code", label: "Code", icon: Code },
  { key: "target", label: "Target", icon: Target },
  { key: "award", label: "Award", icon: Award },
  { key: "crown", label: "Crown", icon: Crown },
  { key: "shield", label: "Shield", icon: Shield },
];

const VARIABLE_LABELS: Record<WhitelistVariable, string> = {
  total_solved: "Total Solved",
  easy_solved: "Easy Solved",
  medium_solved: "Medium Solved",
  hard_solved: "Hard Solved",
  contest_rating: "Contest Rating",
  contests_attended: "Contests Attended",
  current_streak: "Current Streak (Days)",
  longest_streak: "Longest Streak (Days)",
};

const CATEGORIES = [
  "PROBLEM_SOLVING",
  "DIFFICULTY_MASTERY",
  "CONTEST_PROWESS",
  "CONSISTENCY",
  "GENERAL",
];

const RARITY_COLORS = {
  COMMON: {
    badge: "bg-slate-700/60 text-slate-300 border-slate-600",
    glow: "border-slate-700/50 bg-slate-800/40",
    text: "text-slate-400",
  },
  RARE: {
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    glow: "border-blue-500/30 bg-blue-950/20",
    text: "text-blue-400",
  },
  EPIC: {
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    glow: "border-purple-500/30 bg-purple-950/20",
    text: "text-purple-400",
  },
  LEGENDARY: {
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    glow: "border-amber-500/30 bg-amber-950/20",
    text: "text-amber-400",
  },
};

export interface AchievementInitialData {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  iconKey?: string;
  conditionExpression?: string;
  rarityLevel?: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  points?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

interface AchievementBuilderFormProps {
  initialData?: AchievementInitialData;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ConditionClause {
  variable: WhitelistVariable;
  operator: AllowedOperator;
  value: number;
  conjunction: "AND" | "OR";
}

export function AchievementBuilderForm({
  initialData,
  onSuccess,
  onCancel,
}: AchievementBuilderFormProps) {
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "PROBLEM_SOLVING");
  const [iconKey, setIconKey] = useState(initialData?.iconKey || "trophy");
  const [rarityLevel, setRarityLevel] = useState<"COMMON" | "RARE" | "EPIC" | "LEGENDARY">(
    initialData?.rarityLevel || "COMMON"
  );
  const [points, setPoints] = useState(initialData?.points ?? 10);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    initialData?.status || "DRAFT"
  );

  const [conditionExpression, setConditionExpression] = useState(
    initialData?.conditionExpression || "total_solved >= 100"
  );

  // Visual builder clauses
  const [clauses, setClauses] = useState<ConditionClause[]>([
    { variable: "total_solved", operator: ">=", value: 100, conjunction: "AND" },
  ]);

  const [builderMode, setBuilderMode] = useState<"visual" | "advanced">("visual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Live syntax linting
  const lintResult = useMemo(() => {
    return validateAchievementCondition(conditionExpression);
  }, [conditionExpression]);

  // Sync clauses to expression string when visual builder changes
  const applyClausesToExpression = (updatedClauses: ConditionClause[]) => {
    if (updatedClauses.length === 0) return;
    const parts: string[] = [];
    updatedClauses.forEach((c, idx) => {
      if (idx > 0) {
        parts.push(c.conjunction);
      }
      parts.push(`${c.variable} ${c.operator} ${c.value}`);
    });
    const expr = parts.join(" ");
    setConditionExpression(expr);
  };

  const handleAddClause = () => {
    const next: ConditionClause = {
      variable: "hard_solved",
      operator: ">=",
      value: 10,
      conjunction: "AND",
    };
    const updated = [...clauses, next];
    setClauses(updated);
    applyClausesToExpression(updated);
  };

  const handleRemoveClause = (idx: number) => {
    if (clauses.length <= 1) return;
    const updated = clauses.filter((_, i) => i !== idx);
    setClauses(updated);
    applyClausesToExpression(updated);
  };

  const handleClauseChange = (
    idx: number,
    field: keyof ConditionClause,
    val: any
  ) => {
    const updated = [...clauses];
    updated[idx] = { ...updated[idx], [field]: val };
    setClauses(updated);
    applyClausesToExpression(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateAchievementInput({
      name,
      description,
      category,
      iconKey,
      conditionExpression,
      rarityLevel,
      points,
      status,
    });

    if (!validation.isValid) {
      const firstErr = Object.values(validation.errors)[0];
      setSubmitError(firstErr);
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isEditing
        ? `/api/admin/achievements/${initialData?.id}`
        : "/api/admin/achievements";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          iconKey,
          conditionExpression,
          rarityLevel,
          points,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save achievement.");
      }

      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIcon = ICONS.find((i) => i.key === iconKey)?.icon || Trophy;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-lg border border-red-500/30 bg-red-950/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Preservation Notice if editing */}
      {isEditing && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Grandfathering Guarantee (FR-610):</span> Existing
            student recipients will permanently retain this badge with their original unlock date
            and marked as legacy. Modifications will strictly apply to future evaluations.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Inputs */}
        <div className="lg:col-span-8 space-y-5">
          {/* Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Achievement Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Century Solver"
                maxLength={50}
                required
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">3–50 characters</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/80 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Successfully solved 100 or more LeetCode algorithmic problems."
              rows={2}
              maxLength={250}
              required
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">10–250 characters</p>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Badge Icon
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {ICONS.map(({ key, icon: IconComponent, label }) => {
                const isSelected = iconKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    onClick={() => setIconKey(key)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/15 text-amber-400"
                        : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rarity & Points & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Rarity Level
              </label>
              <select
                value={rarityLevel}
                onChange={(e) => setRarityLevel(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/80"
              >
                <option value="COMMON">Common</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="LEGENDARY">Legendary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Points Weight
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/80"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Unlock Rule Engine */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Unlock Condition Engine</h4>
                <p className="text-xs text-slate-400">
                  Defines the algorithmic condition required to award this badge.
                </p>
              </div>
              <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setBuilderMode("visual")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    builderMode === "visual"
                      ? "bg-amber-500/20 text-amber-300 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Visual Builder
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderMode("advanced")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    builderMode === "advanced"
                      ? "bg-amber-500/20 text-amber-300 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Raw Expression
                </button>
              </div>
            </div>

            {/* Visual Builder Mode */}
            {builderMode === "visual" && (
              <div className="space-y-3">
                {clauses.map((clause, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs"
                  >
                    {idx > 0 && (
                      <select
                        value={clause.conjunction}
                        onChange={(e) => handleClauseChange(idx, "conjunction", e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-amber-400 font-bold rounded px-2 py-1"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    )}

                    <select
                      value={clause.variable}
                      onChange={(e) => handleClauseChange(idx, "variable", e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1"
                    >
                      {WHITELIST_VARIABLES.map((v) => (
                        <option key={v} value={v}>
                          {VARIABLE_LABELS[v]} ({v})
                        </option>
                      ))}
                    </select>

                    <select
                      value={clause.operator}
                      onChange={(e) => handleClauseChange(idx, "operator", e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 font-mono font-bold"
                    >
                      <option value=">=">&gt;=</option>
                      <option value=">">&gt;</option>
                      <option value="<=">&lt;=</option>
                      <option value="<">&lt;</option>
                      <option value="==">==</option>
                      <option value="!=">!=</option>
                    </select>

                    <input
                      type="number"
                      min={0}
                      value={clause.value}
                      onChange={(e) =>
                        handleClauseChange(idx, "value", Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-20 bg-slate-800 border border-slate-700 text-slate-100 rounded px-2.5 py-1 font-mono"
                    />

                    {clauses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveClause(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors ml-auto"
                        title="Remove condition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddClause}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium py-1 px-2 rounded hover:bg-amber-500/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Condition Clause
                </button>
              </div>
            )}

            {/* Raw Expression Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Rule Syntax Expression</span>
                <span className="text-[11px] text-slate-500">
                  Whitelist: {WHITELIST_VARIABLES.join(", ")}
                </span>
              </div>
              <input
                type="text"
                value={conditionExpression}
                onChange={(e) => setConditionExpression(e.target.value)}
                placeholder="e.g. total_solved >= 100 AND hard_solved >= 10"
                className="w-full font-mono text-xs bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/80"
              />

              {/* Real-time Syntax Linter Feedback */}
              {lintResult.isValid ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Valid expression! Detected variables:{" "}
                    <span className="font-mono font-semibold">
                      {lintResult.variables.join(", ") || "none"}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{lintResult.error || "Malformed condition expression"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Preview Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Live Badge Preview
          </div>

          <div
            className={`rounded-xl border p-5 transition-all text-center flex flex-col items-center justify-center ${
              RARITY_COLORS[rarityLevel].glow
            }`}
          >
            {/* Icon Container */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
                RARITY_COLORS[rarityLevel].badge
              }`}
            >
              <SelectedIcon className="w-8 h-8" />
            </div>

            <span
              className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border mb-1.5 ${
                RARITY_COLORS[rarityLevel].badge
              }`}
            >
              {rarityLevel} • {points} PTS
            </span>

            <h3 className="text-base font-bold text-slate-100">
              {name || "Untitled Achievement"}
            </h3>

            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {description || "No description provided yet."}
            </p>

            <div className="w-full mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-left">
              <span className="text-slate-500 font-semibold block mb-0.5 uppercase tracking-wider text-[9px]">
                Requirement:
              </span>
              <code className="block bg-slate-900/80 px-2 py-1 rounded border border-slate-800/80 font-mono text-[10px] text-amber-300/90 break-all">
                {conditionExpression || "No condition specified"}
              </code>
            </div>

            <div className="mt-3 flex items-center justify-between w-full text-[11px]">
              <span className="text-slate-500">Status</span>
              <span
                className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                  status === "PUBLISHED"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : status === "ARCHIVED"
                    ? "bg-slate-700/50 text-slate-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !lintResult.isValid}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{isEditing ? "Update Achievement" : "Create Achievement"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
