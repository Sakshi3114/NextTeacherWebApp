// Seed script — creates a demoable baseline instead of migrating the old
// Mongo demo data (which was disposable and didn't fit the new schema shape
// anyway). Re-run any time with `npm run db:reset`.
require("dotenv/config");
const { PrismaClient, Role, DayOfWeek } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// Neon's first connection (TLS handshake) can outlast Prisma's default 2s
// transaction-acquisition window, especially waking from idle — see
// lib/prisma.js for the same setting used by the deployed app.
const prisma = new PrismaClient({ adapter, transactionOptions: { maxWait: 15000, timeout: 15000 } });

const ADMIN_EMAIL = "admin@school.edu";
const ADMIN_PASSWORD = "ChangeMe123!";
const TEACHER_PASSWORD = "ChangeMe123!";
const STUDENT_PASSWORD = "ChangeMe123!";

async function main() {
  console.log("Seeding database...");

  // Sequential, not a batched $transaction: the first query on a freshly
  // created pool pays for the TCP+TLS handshake to Neon, which can outlast
  // Prisma's default transaction-acquisition window on a cold connection.
  // FK order matters here (children before parents).
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.period.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.student.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      name: "Site Admin",
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const departments = await Promise.all(
    ["Computer Science", "Mathematics", "English"].map((name) => prisma.department.create({ data: { name } }))
  );
  const [cs, math, english] = departments;

  const subjectDefs = [
    { name: "Data Structures", code: "CS201", department: cs },
    { name: "Web Development", code: "CS305", department: cs },
    { name: "Calculus II", code: "MA201", department: math },
    { name: "Linear Algebra", code: "MA210", department: math },
    { name: "World Literature", code: "EN110", department: english },
  ];
  const subjects = await Promise.all(
    subjectDefs.map((s) => prisma.subject.create({ data: { name: s.name, code: s.code, departmentId: s.department.id } }))
  );

  const teacherDefs = [
    { name: "Dr. Asha Verma", email: "asha.verma@school.edu", department: cs, subjects: [subjects[0], subjects[1]] },
    { name: "Mr. Ravi Kapoor", email: "ravi.kapoor@school.edu", department: math, subjects: [subjects[2], subjects[3]] },
    { name: "Ms. Leah Thompson", email: "leah.thompson@school.edu", department: english, subjects: [subjects[4]] },
  ];

  const teacherPasswordHash = await bcrypt.hash(TEACHER_PASSWORD, 10);
  const teacherRecords = [];
  for (const def of teacherDefs) {
    const user = await prisma.user.create({
      data: {
        name: def.name,
        email: def.email,
        passwordHash: teacherPasswordHash,
        role: Role.TEACHER,
        teacher: { create: { departmentId: def.department.id, phone: "+1 555 0100" } },
      },
      include: { teacher: true },
    });
    teacherRecords.push({ ...user.teacher, subjects: def.subjects });
  }

  const slots = [
    { day: DayOfWeek.MONDAY, startTime: "09:00", endTime: "10:00", room: "101" },
    { day: DayOfWeek.WEDNESDAY, startTime: "11:00", endTime: "12:00", room: "204" },
    { day: DayOfWeek.FRIDAY, startTime: "13:00", endTime: "14:00", room: "101" },
  ];

  for (const teacher of teacherRecords) {
    for (let i = 0; i < teacher.subjects.length; i += 1) {
      const slot = slots[i % slots.length];
      await prisma.period.create({
        data: {
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room,
          teacherId: teacher.id,
          subjectId: teacher.subjects[i].id,
        },
      });
    }
  }

  // Students + enrollments: needed so the Phase 2 timetable/attendance
  // features have a real roster to work with (student self-service login
  // itself is still Phase 3 scope).
  const studentDefs = [
    { name: "Priya Nair", email: "priya.nair@school.edu", roll: "CS-001", department: cs, subjects: [subjects[0], subjects[1]] },
    { name: "Marcus Lee", email: "marcus.lee@school.edu", roll: "CS-002", department: cs, subjects: [subjects[0], subjects[1]] },
    { name: "Sofia Alvarez", email: "sofia.alvarez@school.edu", roll: "CS-003", department: cs, subjects: [subjects[0]] },
    { name: "Ethan Brooks", email: "ethan.brooks@school.edu", roll: "MA-001", department: math, subjects: [subjects[2], subjects[3]] },
    { name: "Wei Zhang", email: "wei.zhang@school.edu", roll: "MA-002", department: math, subjects: [subjects[2], subjects[3]] },
    { name: "Ananya Iyer", email: "ananya.iyer@school.edu", roll: "MA-003", department: math, subjects: [subjects[3]] },
    { name: "Jonas Miller", email: "jonas.miller@school.edu", roll: "EN-001", department: english, subjects: [subjects[4]] },
    { name: "Grace Okafor", email: "grace.okafor@school.edu", roll: "EN-002", department: english, subjects: [subjects[4]] },
  ];

  const studentPasswordHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
  for (const def of studentDefs) {
    const user = await prisma.user.create({
      data: {
        name: def.name,
        email: def.email,
        passwordHash: studentPasswordHash,
        role: Role.STUDENT,
        student: {
          create: { rollNumber: def.roll, departmentId: def.department.id },
        },
      },
      include: { student: true },
    });
    for (const subject of def.subjects) {
      await prisma.enrollment.create({
        data: { studentId: user.student.id, subjectId: subject.id },
      });
    }
  }

  const firstTeacherUser = await prisma.user.findUnique({ where: { email: teacherDefs[0].email } });
  await prisma.notice.create({
    data: {
      title: "Welcome back!",
      body: "Classes resume Monday. Please check your schedule for any room changes.",
      authorId: firstTeacherUser.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seed complete.");
  console.log("---------------------------------------------");
  console.log(`Admin login:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Teacher login: ${teacherDefs[0].email} / ${TEACHER_PASSWORD}`);
  console.log(`Student login: ${studentDefs[0].email} / ${STUDENT_PASSWORD} (no dashboard yet — Phase 3)`);
  console.log("Change these passwords after first sign-in.");
  console.log("---------------------------------------------");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
