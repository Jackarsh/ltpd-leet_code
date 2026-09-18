export interface RuleVariables {
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  contest_rating: number;
  contests_attended: number;
  current_streak: number;
  longest_streak: number;
}

/**
 * Safely evaluates a condition expression against provided variables.
 * Does NOT use eval(). Evaluates simple and compound conditions with AND / OR.
 * e.g. "total_solved >= 100 AND hard_solved >= 10"
 */
export function evaluateCondition(expression: string, vars: RuleVariables): boolean {
  if (!expression || expression.trim() === '') return false;

  const cleanExpr = expression.trim();

  // Split on OR / ||
  const orParts = cleanExpr.split(/\s+OR\s+|\s*\|\|\s*/i);
  if (orParts.length > 1) {
    return orParts.some((part) => evaluateCondition(part, vars));
  }

  // Split on AND / &&
  const andParts = cleanExpr.split(/\s+AND\s+|\s*&&\s*/i);
  if (andParts.length > 1) {
    return andParts.every((part) => evaluateCondition(part, vars));
  }

  // Single comparison: e.g. "total_solved >= 100"
  return evaluateSimpleComparison(cleanExpr, vars);
}

function evaluateSimpleComparison(clause: string, vars: RuleVariables): boolean {
  const match = clause.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(>=|<=|>|<|==|!=|=)\s*(\d+(\.\d+)?)$/);
  if (!match) {
    console.warn(`[AchievementRule] Invalid comparison clause: "${clause}"`);
    return false;
  }

  const [, varName, op, valStr] = match;
  const targetVal = parseFloat(valStr);

  const lowerVar = varName.toLowerCase();
  const actualVal = (vars as unknown as Record<string, number>)[lowerVar] ?? 0;

  switch (op) {
    case '>=':
      return actualVal >= targetVal;
    case '<=':
      return actualVal <= targetVal;
    case '>':
      return actualVal > targetVal;
    case '<':
      return actualVal < targetVal;
    case '==':
    case '=':
      return actualVal === targetVal;
    case '!=':
      return actualVal !== targetVal;
    default:
      return false;
  }
}