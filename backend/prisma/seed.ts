//Populates database with realistic starter data 
/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users...');
  const student1 = await prisma.user.create({
    data: {
      name: 'Sara Al-Mansoor',
      email: 'sara@example.com',
      password: 'hashed_password_123',
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Omar Al-Ghamdi',
      email: 'omar@example.com',
      password: 'hashed_password_123',
      role: 'STUDENT',
    },
  });

  console.log('Seeding Trainers...');
  await prisma.trainer.createMany({
    data: [
      {
        name: 'Dr. Tariq Al-Otaibi',
        email: 'tariq@bootcamp.com',
        bio: 'Senior Full Stack Lead with 10+ years in distributed web systems.',
        specialization: 'Full Stack Engineering',
      },
      {
        name: 'Eng. Mona Al-Harbi',
        email: 'mona@bootcamp.com',
        bio: 'Database Administrator and Cloud Architecture Specialist.',
        specialization: 'Database Systems & DevOps',
      },
    ],
  });

  console.log('Seeding Courses...');
  const course1 = await prisma.course.create({
    data: {
      title: 'Full-Stack Web Systems & APIs',
      description: 'Master Express, Prisma, and React integration.',
      price: 1500,
      seatsLeft: 25,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Database Architecture & Security',
      description: 'Relational database design, indexes, and access control.',
      price: 1800,
      seatsLeft: 20,
    },
  });

  console.log('Seeding Enrollments...');
  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: course1.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student2.id,
      courseId: course1.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: course2.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });