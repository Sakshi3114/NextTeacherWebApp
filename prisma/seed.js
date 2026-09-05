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

function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  return daysAgo(-n);
}

const DAY_INDEX = { MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6 };

// The most recent `count` real calendar dates that fall on the given
// DayOfWeek, oldest first — used to seed attendance sessions on dates that
// actually match a period's recurring weekday.
function pastDatesForWeekday(dayEnum, count) {
  const targetIndex = DAY_INDEX[dayEnum];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceTarget = (today.getDay() - targetIndex + 7) % 7;
  const dates = [];
  for (let w = 0; w < count; w += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysSinceTarget - w * 7);
    dates.push(d);
  }
  return dates.reverse();
}

// Weighted so charts look like a real (imperfect) attendance record, not a
// uniform 100%.
function randomAttendanceStatus() {
  const r = Math.random();
  if (r < 0.82) return "PRESENT";
  if (r < 0.92) return "ABSENT";
  if (r < 0.97) return "LATE";
  return "EXCUSED";
}

async function main() {
  console.log("Seeding database...");

  // Sequential, not a batched $transaction: the first query on a freshly
  // created pool pays for the TCP+TLS handshake to Neon, which can outlast
  // Prisma's default transaction-acquisition window on a cold connection.
  // FK order matters here (children before parents).
  await prisma.notification.deleteMany();
  await prisma.noticeRead.deleteMany();
  await prisma.leaveRequest.deleteMany();
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
  const adminUser = await prisma.user.create({
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

  const createdPeriods = [];
  for (const teacher of teacherRecords) {
    for (let i = 0; i < teacher.subjects.length; i += 1) {
      const slot = slots[i % slots.length];
      const period = await prisma.period.create({
        data: {
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room,
          teacherId: teacher.id,
          subjectId: teacher.subjects[i].id,
        },
      });
      createdPeriods.push(period);
    }
  }

  // Students + enrollments.
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
  const studentRecords = [];
  const enrollmentsBySubject = new Map();
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
    studentRecords.push(user.student);
    for (const subject of def.subjects) {
      await prisma.enrollment.create({
        data: { studentId: user.student.id, subjectId: subject.id },
      });
      const list = enrollmentsBySubject.get(subject.id) ?? [];
      list.push(user.student.id);
      enrollmentsBySubject.set(subject.id, list);
    }
  }

  // Attendance history: real sessions on real past dates matching each
  // period's weekday, over the last month, with a realistic (not perfect)
  // present/absent/late/excused mix — otherwise the analytics dashboard and
  // calendar have nothing to show on first load.
  for (const period of createdPeriods) {
    const studentIds = enrollmentsBySubject.get(period.subjectId) ?? [];
    if (studentIds.length === 0) continue;
    const dates = pastDatesForWeekday(period.day, 4);
    for (const date of dates) {
      const session = await prisma.attendanceSession.create({
        data: { periodId: period.id, teacherId: period.teacherId, date },
      });
      for (const studentId of studentIds) {
        await prisma.attendanceRecord.create({
          data: { sessionId: session.id, studentId, status: randomAttendanceStatus() },
        });
      }
    }
  }

  // Notices spread over the last few weeks, with varied read receipts so
  // the engagement table on /admin/analytics shows a real spread instead of
  // one all-or-nothing row.
  const noticeDefs = [
    { title: "Welcome back!", body: "Classes resume Monday. Please check your schedule for any room changes.", daysAgo: 21, readFraction: 1 },
    { title: "Midterm schedule posted", body: "Midterm exam windows are now posted for all departments. Review the timetable for your subjects.", daysAgo: 14, readFraction: 0.75 },
    { title: "Library hours extended", body: "The library will stay open until 9pm on weekdays through the end of the term.", daysAgo: 10, readFraction: 0.375 },
    { title: "Room change: CS201", daysAgo: 6, body: "Data Structures moves to Room 210 starting next week for the rest of the term.", readFraction: 0.625 },
    { title: "Guest lecture Friday", body: "A guest lecture on distributed systems runs Friday afternoon — open to all Computer Science students.", daysAgo: 3, readFraction: 0.25 },
    { title: "Holiday schedule reminder", body: "No classes next Monday. Regular schedule resumes Tuesday.", daysAgo: 1, readFraction: 0 },
  ];

  for (let i = 0; i < noticeDefs.length; i += 1) {
    const def = noticeDefs[i];
    const author = teacherRecords[i % teacherRecords.length];
    const authorUser = await prisma.user.findUnique({ where: { id: author.userId } });
    const createdAt = daysAgo(def.daysAgo);
    const notice = await prisma.notice.create({
      data: {
        title: def.title,
        body: def.body,
        authorId: authorUser.id,
        createdAt,
        expiresAt: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    const readCount = Math.round(studentRecords.length * def.readFraction);
    for (let s = 0; s < readCount; s += 1) {
      await prisma.noticeRead.create({
        data: { noticeId: notice.id, studentId: studentRecords[s].id },
      });
    }
  }

  // Leave requests spread across the last few months with a mix of
  // statuses, so /admin/leave, /teacher/leave, and the analytics "leave
  // trends" chart all have real variety instead of one pending row.
  const leaveDefs = [
    { teacher: teacherRecords[0], start: daysAgo(62), end: daysAgo(60), reason: "Family emergency.", status: "APPROVED", substitute: teacherRecords[1] },
    { teacher: teacherRecords[1], start: daysAgo(45), end: daysAgo(45), reason: "Medical appointment.", status: "APPROVED", substitute: null },
    { teacher: teacherRecords[2], start: daysAgo(30), end: daysAgo(28), reason: "Personal travel.", status: "REJECTED", substitute: null },
    { teacher: teacherRecords[0], start: daysAgo(20), end: daysAgo(20), reason: "Conference attendance.", status: "APPROVED", substitute: teacherRecords[2] },
    { teacher: teacherRecords[2], start: daysAgo(5), end: daysAgo(4), reason: "Family event.", status: "PENDING", substitute: null },
    { teacher: teacherRecords[1], start: daysFromNow(7), end: daysFromNow(9), reason: "Attending a conference.", status: "PENDING", substitute: teacherRecords[0] },
  ];

  for (const def of leaveDefs) {
    const decided = def.status !== "PENDING";
    await prisma.leaveRequest.create({
      data: {
        teacherId: def.teacher.id,
        startDate: def.start,
        endDate: def.end,
        reason: def.reason,
        status: def.status,
        substituteId: def.substitute?.id ?? null,
        decidedById: decided ? adminUser.id : null,
        decidedAt: decided ? def.end : null,
      },
    });
  }

  console.log("Seed complete.");
  console.log("---------------------------------------------");
  console.log(`Admin login:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Teacher login: ${teacherDefs[0].email} / ${TEACHER_PASSWORD}`);
  console.log(`Student login: ${studentDefs[0].email} / ${STUDENT_PASSWORD}`);
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
