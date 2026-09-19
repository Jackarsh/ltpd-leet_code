/**
 * Achievement Condition AST Parser & Syntax Validator (FR-609, SC-606)
 *
 * Validates condition expressions against the strictly allowed whitelist of verified
 * coding statistics variables and standard comparison/logical operators.
 */

export const WHITELIST_VARIABLES = [
  "total_solved",
  "easy_solved",
  "medium_solved",
  "hard_solved",
  "contest_rating",
  "contests_attended",
  "current_streak",
  "longest_streak",
] as const;

export type WhitelistVariable = (typeof WHITELIST_VARIABLES)[number];

export const ALLOWED_OPERATORS = [">=", "<=", ">", "<", "==", "!=", "="] as const;
export type AllowedOperator = (typeof ALLOWED_OPERATORS)[number];

export const ALLOWED_CONJUNCTIONS = ["AND", "OR", "&&", "||"] as const;
export type AllowedConjunction = (typeof ALLOWED_CONJUNCTIONS)[number];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  variables: WhitelistVariable[];
  ast?: ConditionNode;
}

export type ConditionNode =
  | {
      type: "LOGICAL";
      operator: "AND" | "OR";
      left: ConditionNode;
      right: ConditionNode;
    }
  | {
      type: "COMPARISON";
      variable: WhitelistVariable;
      operator: AllowedOperator;
      value: number;
    };

interface Token {
  type: "VARIABLE" | "OPERATOR" | "NUMBER" | "CONJUNCTION" | "LPAREN" | "RPAREN";
  value: string;
  position: number;
}

/**
 * Tokenizes a condition expression into a stream of typed tokens.
 */
function tokenize(expression: string): { tokens: Token[]; error?: string } {
  const tokens: Token[] = [];
  let i = 0;
  const len = expression.length;

  while (i < len) {
    const char = expression[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Parentheses
    if (char === "(") {
      tokens.push({ type: "LPAREN", value: "(", position: i });
      i++;
      continue;
    }
    if (char === ")") {
      tokens.push({ type: "RPAREN", value: ")", position: i });
      i++;
      continue;
    }

    // Invalid multi-character operators
    const threeChars = expression.slice(i, i + 3);
    if (threeChars === "===" || threeChars === "!==") {
      return { tokens: [], error: `Invalid operator "${threeChars}" at position ${i}. Use "==" or "!=" instead.` };
    }

    // Two-character operators & conjunctions
    const twoChars = expression.slice(i, i + 2);
    if (twoChars === ">=" || twoChars === "<=" || twoChars === "==" || twoChars === "!=") {
      tokens.push({ type: "OPERATOR", value: twoChars, position: i });
      i += 2;
      continue;
    }
    if (twoChars === "&&") {
      tokens.push({ type: "CONJUNCTION", value: "AND", position: i });
      i += 2;
      continue;
    }
    if (twoChars === "||") {
      tokens.push({ type: "CONJUNCTION", value: "OR", position: i });
      i += 2;
      continue;
    }

    // Single-character operators
    if (char === ">" || char === "<" || char === "=") {
      tokens.push({ type: "OPERATOR", value: char, position: i });
      i++;
      continue;
    }

    // Numbers (positive or negative, integers or decimals)
    if (/[0-9]/.test(char) || (char === "-" && /[0-9]/.test(expression[i + 1] || ""))) {
      const start = i;
      if (char === "-") i++;
      while (i < len && /[0-9.]/.test(expression[i])) {
        i++;
      }
      const numStr = expression.slice(start, i);
      if (isNaN(Number(numStr)) || (numStr.match(/\./g) || []).length > 1) {
        return { tokens: [], error: `Invalid number format "${numStr}" at position ${start}` };
      }
      tokens.push({ type: "NUMBER", value: numStr, position: start });
      continue;
    }

    // Identifiers (Variable names or AND/OR keywords)
    if (/[a-zA-Z_]/.test(char)) {
      const start = i;
      while (i < len && /[a-zA-Z0-9_]/.test(expression[i])) {
        i++;
      }
      const ident = expression.slice(start, i);
      const upper = ident.toUpperCase();

      if (upper === "AND" || upper === "OR") {
        tokens.push({ type: "CONJUNCTION", value: upper, position: start });
      } else {
        tokens.push({ type: "VARIABLE", value: ident.toLowerCase(), position: start });
      }
      continue;
    }

    // Unrecognized character
    return {
      tokens: [],
      error: `Unexpected character "${char}" at position ${i}`,
    };
  }

  return { tokens };
}

/**
 * Validates and parses a condition expression against the whitelist schema.
 */
export function validateAchievementCondition(expression: string): ValidationResult {
  if (!expression || expression.trim() === "") {
    return {
      isValid: false,
      error: "Condition expression cannot be empty",
      variables: [],
    };
  }

  const { tokens, error: tokenizeError } = tokenize(expression.trim());
  if (tokenizeError) {
    return { isValid: false, error: tokenizeError, variables: [] };
  }

  if (tokens.length === 0) {
    return { isValid: false, error: "Condition expression contains no tokens", variables: [] };
  }

  const detectedVariables = new Set<WhitelistVariable>();
  let current = 0;

  function peek(): Token | undefined {
    return tokens[current];
  }

  function consume(): Token {
    return tokens[current++];
  }

  // Recursive descent parser
  try {
    const ast = parseOrExpr();

    if (current < tokens.length) {
      const extra = tokens[current];
      return {
        isValid: false,
        error: `Unexpected token "${extra.value}" at position ${extra.position}`,
        variables: Array.from(detectedVariables),
      };
    }

    return {
      isValid: true,
      variables: Array.from(detectedVariables),
      ast,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Malformed condition expression";
    return {
      isValid: false,
      error: message,
      variables: Array.from(detectedVariables),
    };
  }

  function parseOrExpr(): ConditionNode {
    let node = parseAndExpr();

    while (peek() && peek()!.type === "CONJUNCTION" && peek()!.value === "OR") {
      consume(); // consume 'OR'
      const right = parseAndExpr();
      node = {
        type: "LOGICAL",
        operator: "OR",
        left: node,
        right,
      };
    }

    return node;
  }

  function parseAndExpr(): ConditionNode {
    let node = parsePrimary();

    while (peek() && peek()!.type === "CONJUNCTION" && peek()!.value === "AND") {
      consume(); // consume 'AND'
      const right = parsePrimary();
      node = {
        type: "LOGICAL",
        operator: "AND",
        left: node,
        right,
      };
    }

    return node;
  }

  function parsePrimary(): ConditionNode {
    const tok = peek();
    if (!tok) {
      throw new Error("Unexpected end of expression");
    }

    if (tok.type === "LPAREN") {
      consume(); // consume '('
      if (peek() && peek()!.type === "RPAREN") {
        throw new Error(`Empty parenthesis group '()' at position ${tok.position}`);
      }
      const inner = parseOrExpr();
      const closing = peek();
      if (!closing || closing.type !== "RPAREN") {
        throw new Error("Missing closing parenthesis ')'");
      }
      consume(); // consume ')'
      return inner;
    }

    return parseComparison();
  }

  function parseComparison(): ConditionNode {
    const varTok = peek();
    if (!varTok) {
      throw new Error("Expected comparison clause, found end of expression");
    }

    if (varTok.type !== "VARIABLE") {
      throw new Error(`Expected variable name at position ${varTok.position}, found "${varTok.value}"`);
    }

    consume();

    // Check variable against whitelist
    const varName = varTok.value as WhitelistVariable;
    if (!WHITELIST_VARIABLES.includes(varName)) {
      throw new Error(
        `Disallowed variable "${varTok.value}". Permitted variables: ${WHITELIST_VARIABLES.join(", ")}`
      );
    }
    detectedVariables.add(varName);

    const opTok = peek();
    if (!opTok || opTok.type !== "OPERATOR") {
      throw new Error(
        `Expected comparison operator after "${varName}" at position ${opTok ? opTok.position : "end"}`
      );
    }
    consume();

    const valTok = peek();
    if (!valTok || valTok.type !== "NUMBER") {
      throw new Error(
        `Expected numeric value after "${opTok.value}" at position ${valTok ? valTok.position : "end"}`
      );
    }
    consume();

    const numericVal = parseFloat(valTok.value);
    if (numericVal < 0) {
      throw new Error(`Negative numbers are not allowed for statistics comparisons: "${valTok.value}"`);
    }

    return {
      type: "COMPARISON",
      variable: varName,
      operator: opTok.value as AllowedOperator,
      value: numericVal,
    };
  }
}

export interface AchievementFormInput {
  name: string;
  description: string;
  category: string;
  iconKey: string;
  conditionExpression: string;
  rarityLevel: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  points: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

/**
 * Sanitizes and validates full achievement administrative input.
 */
export function validateAchievementInput(input: Partial<AchievementFormInput>): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: AchievementFormInput;
} {
  const errors: Record<string, string> = {};

  const name = (input.name || "").trim();
  if (name.length < 3 || name.length > 50) {
    errors.name = "Achievement name must be between 3 and 50 characters.";
  }

  const description = (input.description || "").trim();
  if (description.length < 10 || description.length > 250) {
    errors.description = "Description must be between 10 and 250 characters.";
  }

  const category = (input.category || "GENERAL").trim().toUpperCase();
  if (!category) {
    errors.category = "Category cannot be empty.";
  }

  const iconKey = (input.iconKey || "trophy").trim().toLowerCase();
  if (!iconKey) {
    errors.iconKey = "Icon key is required.";
  }

  const conditionExpression = (input.conditionExpression || "").trim();
  const condValidation = validateAchievementCondition(conditionExpression);
  if (!condValidation.isValid) {
    errors.conditionExpression = condValidation.error || "Invalid condition expression.";
  }

  const rarityLevel = (input.rarityLevel || "COMMON").toUpperCase() as "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  if (!["COMMON", "RARE", "EPIC", "LEGENDARY"].includes(rarityLevel)) {
    errors.rarityLevel = "Rarity must be COMMON, RARE, EPIC, or LEGENDARY.";
  }

  const points = Number(input.points ?? 10);
  if (isNaN(points) || points < 1 || points > 1000 || !Number.isInteger(points)) {
    errors.points = "Points must be an integer between 1 and 1000.";
  }

  const status = (input.status || "DRAFT").toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
    errors.status = "Status must be DRAFT, PUBLISHED, or ARCHIVED.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      name,
      description,
      category,
      iconKey,
      conditionExpression,
      rarityLevel,
      points,
      status,
    },
  };
}
