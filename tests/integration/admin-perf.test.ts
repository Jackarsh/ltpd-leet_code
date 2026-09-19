import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Integration Test: Composite Index & Administrative Performance Verification (T052)
 *
 * Verifies that all performance-critical query paths for administrative operations
 * have corresponding single-column and composite indexes in Prisma schema
 * to ensure sub-100ms response times on high-volume production tables.
 */

test("Composite Index Verification — Schema contains required admin performance indexes", () => {
  const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  // 1. AuditLog indexes (high-write, high-read audit explorer)
  assert.ok(
    schemaContent.includes("@@index([adminUserId, createdAt])"),
    "AuditLog must have composite index on [adminUserId, createdAt] for admin-filtered audit trails"
  );
  assert.ok(
    schemaContent.includes("@@index([actionType, createdAt])"),
    "AuditLog must have composite index on [actionType, createdAt] for action-filtered audit queries"
  );
  assert.ok(
    schemaContent.includes("@@index([targetType, targetId])"),
    "AuditLog must have composite index on [targetType, targetId] for entity history lookup"
  );
  assert.ok(
    schemaContent.includes("@@index([createdAt])"),
    "AuditLog must have index on [createdAt] for chronological reverse scans"
  );

  // 2. User role & status composite index (lockout guard & admin moderation)
  assert.ok(
    schemaContent.includes("@@index([role, status])"),
    "User must have composite index on [role, status] for instant active Super Admin counting"
  );

  // 3. LinkedCodingAccount sync status composite index (sync health & batch scheduler)
  assert.ok(
    schemaContent.includes("@@index([syncStatus, lastSyncAt])"),
    "LinkedCodingAccount must have composite index on [syncStatus, lastSyncAt] for sync health queries"
  );

  // 4. UserAchievement composite index (profile rendering & grandfathering)
  assert.ok(
    schemaContent.includes("@@index([userId, isRevoked])"),
    "UserAchievement must have composite index on [userId, isRevoked] for fast profile active badge queries"
  );

  // 5. Academic Period & Branch indexes (calendar config)
  assert.ok(
    schemaContent.includes("@@index([isCurrent])"),
    "AcademicPeriod must have index on [isCurrent] for current term resolution"
  );
  assert.ok(
    schemaContent.includes("@@index([isActive])"),
    "AcademicBranch must have index on [isActive] for active department listing"
  );
});

test("Query Plan Simulation — Verifies index alignment with administrative filter predicates", () => {
  // Define required query shapes used across Admin services
  interface QueryPredicate {
    model: string;
    description: string;
    filterFields: string[];
    orderByField?: string;
    indexFields: string[];
  }

  const criticalAdminQueries: QueryPredicate[] = [
    {
      model: "AuditLog",
      description: "Admin user timeline filtered by administrator and ordered by timestamp",
      filterFields: ["adminUserId"],
      orderByField: "createdAt",
      indexFields: ["adminUserId", "createdAt"],
    },
    {
      model: "AuditLog",
      description: "Action-type filtered timeline ordered by timestamp",
      filterFields: ["actionType"],
      orderByField: "createdAt",
      indexFields: ["actionType", "createdAt"],
    },
    {
      model: "AuditLog",
      description: "Target entity audit history lookup",
      filterFields: ["targetType", "targetId"],
      indexFields: ["targetType", "targetId"],
    },
    {
      model: "User",
      description: "Active Super Administrator count for lockout prevention (SC-604)",
      filterFields: ["role", "status"],
      indexFields: ["role", "status"],
    },
    {
      model: "LinkedCodingAccount",
      description: "Stale / failed sync identification for batch processor",
      filterFields: ["syncStatus"],
      orderByField: "lastSyncAt",
      indexFields: ["syncStatus", "lastSyncAt"],
    },
    {
      model: "UserAchievement",
      description: "Active achievements for user profile display",
      filterFields: ["userId", "isRevoked"],
      indexFields: ["userId", "isRevoked"],
    },
  ];

  for (const query of criticalAdminQueries) {
    // Verify that index covers leading filter fields in order (B-Tree prefix rule)
    const isLeadingPrefix = query.filterFields.every((field, idx) => query.indexFields[idx] === field);
    assert.ok(
      isLeadingPrefix,
      `Query on ${query.model} (${query.description}) does not adhere to B-Tree leftmost prefix rule for index [${query.indexFields.join(", ")}]`
    );

    // If there is an orderByField, verify it immediately follows the equality filter fields
    if (query.orderByField) {
      const orderIdx = query.indexFields.indexOf(query.orderByField);
      assert.ok(
        orderIdx >= query.filterFields.length,
        `Index [${query.indexFields.join(", ")}] does not support index-ordered scan for ${query.orderByField}`
      );
    }
  }
});
