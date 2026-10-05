// Scratch verification script — exercises the substitute-finding logic and
// the new schema end-to-end against the real dev DB, then cleans up after
// itself. Run with: node verify-substitution.mjs
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function overlaps(aStart, aEnd, bStart, bEnd) {
  return !(aEnd <= bStart || aStart >= bEnd);
}

async function getFreeTeacherIds(period, date, candidateTeacherIds) {
  if (candidateTeacherIds.length === 0) return new Set();
  const [ownPeriods, approvedLeave, sameDaySubstitutions] = await Promise.all([
    prisma.period.findMany({
      where: { teacherId: { in: candidateTeacherIds }, day: period.day },
      select: { teacherId: true, startTime: true, endTime: true },
    }),
    prisma.leaveRequest.findMany({
      where: { teacherId: { in: candidateTeacherIds }, status: "APPROVED", startDate: { lte: date }, endDate: { gte: date } },
      select: { teacherId: true },
    }),
    prisma.substitution.findMany({
      where: { substituteId: { in: candidateTeacherIds }, date },
      select: { substituteId: true, period: { select: { startTime: true, endTime: true } } },
    }),
  ]);
  const busy = new Set(approvedLeave.map((r) => r.teacherId));
  for (const p of ownPeriods) if (overlaps(period.startTime, period.endTime, p.startTime, p.endTime)) busy.add(p.teacherId);
  for (const s of sameDaySubstitutions) if (overlaps(period.startTime, period.endTime, s.period.startTime, s.period.endTime)) busy.add(s.substituteId);
  return new Set(candidateTeacherIds.filter((id) => !busy.has(id)));
}

const cleanup = [];

async function main() {
  const ravi = await prisma.teacher.findFirst({ where: { user: { email: "ravi.kapoor@school.edu" } }, include: { user: true } });
  const leah = await prisma.teacher.findFirst({ where: { user: { email: "leah.thompson@school.edu" } }, include: { user: true } });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const calc = await prisma.subject.findFirst({ where: { name: "Calculus II" } });
  const raviCalcPeriod = await prisma.period.findFirst({ where: { teacherId: ravi.id, subjectId: calc.id } });
  console.log("Ravi's Calculus II period:", raviCalcPeriod.day, raviCalcPeriod.startTime, "-", raviCalcPeriod.endTime);

  // --- Case 1: before Leah is qualified for Calculus, there should be no candidates.
  let candidates = await prisma.period.findMany({ where: { subjectId: calc.id, teacherId: { not: ravi.id } }, distinct: ["teacherId"] });
  console.log("Candidates before adding a 2nd Calculus teacher:", candidates.length, "(expect 0)");

  // Give Leah a Calculus II period at a DIFFERENT time so she's qualified but free at Ravi's slot.
  const leahPeriod = await prisma.period.create({
    data: { day: raviCalcPeriod.day, startTime: "15:00", endTime: "16:00", subjectId: calc.id, teacherId: leah.id },
  });
  cleanup.push(() => prisma.period.delete({ where: { id: leahPeriod.id } }));
  console.log("Added temp Calculus II period for Leah Thompson (different time, same day) — id", leahPeriod.id);

  candidates = await prisma.period.findMany({ where: { subjectId: calc.id, teacherId: { not: ravi.id } }, distinct: ["teacherId"] });
  console.log("Candidates after:", candidates.length, "(expect 1: Leah)");

  // Pick a real Monday-or-whatever date matching raviCalcPeriod.day for the leave.
  const dayIndexByEnum = { SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6 };
  const targetDow = dayIndexByEnum[raviCalcPeriod.day];
  const date = new Date();
  while (date.getDay() !== targetDow) date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  console.log("Test occurrence date:", date.toDateString());

  const leaveRequest = await prisma.leaveRequest.create({
    data: { teacherId: ravi.id, startDate: date, endDate: date, reason: "verification-script test leave", status: "APPROVED", decidedById: admin.id, decidedAt: new Date() },
  });
  cleanup.push(() => prisma.leaveRequest.delete({ where: { id: leaveRequest.id } }));

  // --- Case 2: getFreeTeacherIds should say Leah is free.
  const freeIds = await getFreeTeacherIds(raviCalcPeriod, date, candidates.map((c) => c.teacherId));
  console.log("Free candidate ids:", [...freeIds], "(expect [", leah.id, "])");
  if (!freeIds.has(leah.id)) throw new Error("FAIL: Leah should be free but wasn't found.");

  // --- Case 3: assign her, verify Substitution + Notification rows, verify she's then excluded from a second overlapping ask.
  const substitution = await prisma.substitution.upsert({
    where: { periodId_date: { periodId: raviCalcPeriod.id, date } },
    create: { periodId: raviCalcPeriod.id, date, originalTeacherId: ravi.id, substituteId: leah.id, leaveRequestId: leaveRequest.id, assignedById: admin.id },
    update: { substituteId: leah.id },
  });
  cleanup.push(() => prisma.substitution.delete({ where: { id: substitution.id } }));

  const notification = await prisma.notification.create({
    data: { userId: leah.userId, type: "SUBSTITUTE_ASSIGNED", message: "verification-script test notification", link: "/teacher" },
  });
  cleanup.push(() => prisma.notification.delete({ where: { id: notification.id } }));
  console.log("Created Substitution", substitution.id, "and Notification", notification.id);

  // --- Case 4: teacher dashboard query — "Covering for others" — should return this row for Leah.
  const covering = await prisma.substitution.findMany({
    where: { substituteId: leah.id, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    include: { period: { include: { subject: true } }, originalTeacher: { include: { user: true } } },
  });
  console.log(
    "Leah's 'Covering for others' rows:",
    covering.map((c) => `${c.period.subject.name} for ${c.originalTeacher.user.name} on ${c.date.toDateString()}`)
  );
  if (covering.length !== 1) throw new Error("FAIL: expected exactly 1 covering row for Leah.");

  // --- Case 5: a second class at the SAME clashing time should now exclude Leah (she's busy covering).
  const freeIdsAfter = await getFreeTeacherIds(raviCalcPeriod, date, candidates.map((c) => c.teacherId));
  console.log("Free candidates for the SAME slot after assignment:", [...freeIdsAfter], "(expect [])");
  if (freeIdsAfter.has(leah.id)) throw new Error("FAIL: Leah should now be excluded (already covering that exact slot).");

  console.log("\nALL CHECKS PASSED");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    for (const fn of cleanup.reverse()) {
      try {
        await fn();
      } catch (e) {
        console.error("cleanup failed:", e.message);
      }
    }
    console.log("Cleanup done.");
    await prisma.$disconnect();
  });
