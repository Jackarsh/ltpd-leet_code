import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creating initial administrative and demo accounts...\n");

  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 12);
  const studentPasswordHash = await bcrypt.hash("StudentPassword123!", 12);

  // 1. Super Admin Account (Full access to all /admin and student views)
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: {
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
      passwordHash: adminPasswordHash,
    },
    create: {
      email: "admin@college.edu",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          displayName: "Super Administrator",
          gender: "FEMALE",
          leetcodeUsername: "platform_admin",
          admissionYear: 2022,
          graduationYear: 2026,
          branch: "Computer Science",
        },
      },
      cardConfig: {
        create: {
          theme: "github-dark",
          layout: "standard",
        },
      },
    },
  });

  // 2. Demo Student Account (For testing student dashboard, leaderboard, card studio)
  const demoStudent = await prisma.user.upsert({
    where: { email: "student@college.edu" },
    update: {
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: new Date(),
      passwordHash: studentPasswordHash,
    },
    create: {
      email: "student@college.edu",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          displayName: "Alex Coder",
          gender: "MALE",
          leetcodeUsername: "alex_coder",
          admissionYear: 2023,
          graduationYear: 2027,
          branch: "Information Technology",
        },
      },
      cardConfig: {
        create: {
          theme: "dracula",
          layout: "standard",
        },
      },
    },
  });

  console.log("✅ Accounts successfully configured!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 SUPER ADMIN (Access to /admin and all pages):");
  console.log("   Email:    admin@college.edu");
  console.log("   Password: AdminPassword123!\n");
  console.log("👤 DEMO STUDENT (Access to student dashboard & studio):");
  console.log("   Email:    student@college.edu");
  console.log("   Password: StudentPassword123!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("👉 Now open: http://localhost:3000/auth/login to sign in.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
