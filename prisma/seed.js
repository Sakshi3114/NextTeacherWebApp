// Seed script — creates a demoable baseline instead of migrating the old
// Mongo demo data (which was disposable and didn't fit the new schema shape
// anyway). Re-run any time with `npm run db:reset`.
const { PrismaClient, Role, DayOfWeek } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@school.edu";
const ADMIN_PASSWORD = "ChangeMe123!";
const TEACHER_PASSWORD = "ChangeMe123!";

async function main() {
  console.log("Seeding database...");

  await prisma.$transaction([
    prisma.notice.deleteMany(),
    prisma.period.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.student.deleteMany(),
    prisma.department.deleteMany(),
    prisma.user.deleteMany(),
  ]);

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
