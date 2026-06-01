import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { ReadingStatus } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const main = async () => {
  const aliceEmail = "alice@example.com";
  const bobEmail = "bob@example.com";

  const alice = await prisma.user.upsert({
    where: { email: aliceEmail },
    update: { name: "Alice" },
    create: {
      id: "user_alice",
      email: aliceEmail,
      name: "Alice",
      passwordHash: hashPassword("password123"),
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: bobEmail },
    update: { name: "Bob" },
    create: {
      id: "user_bob",
      email: bobEmail,
      name: "Bob",
      passwordHash: hashPassword("password123"),
    },
  });

  const books = [
    {
      id: "book_hobbit",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      coverUrl: "https://covers.openlibrary.org/b/id/8101356-L.jpg",
    },
    {
      id: "book_dune",
      title: "Dune",
      author: "Frank Herbert",
      coverUrl: "https://covers.openlibrary.org/b/id/9255563-L.jpg",
    },
    {
      id: "book_atomic_habits",
      title: "Atomic Habits",
      author: "James Clear",
      coverUrl: "https://covers.openlibrary.org/b/id/10521202-L.jpg",
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { id: book.id },
      update: {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
      },
      create: book,
    });
  }

  await prisma.userBook.upsert({
    where: { userId_bookId: { userId: alice.id, bookId: "book_hobbit" } },
    update: {
      status: ReadingStatus.READING,
      rating: 5,
      favorite: true,
      notes: "Cozy fantasy. Great comfort read.",
    },
    create: {
      userId: alice.id,
      bookId: "book_hobbit",
      status: ReadingStatus.READING,
      rating: 5,
      favorite: true,
      notes: "Cozy fantasy. Great comfort read.",
    },
  });

  await prisma.userBook.upsert({
    where: { userId_bookId: { userId: alice.id, bookId: "book_dune" } },
    update: {
      status: ReadingStatus.WANT_TO_READ,
      favorite: false,
      notes: "Want to read next month.",
    },
    create: {
      userId: alice.id,
      bookId: "book_dune",
      status: ReadingStatus.WANT_TO_READ,
      favorite: false,
      notes: "Want to read next month.",
    },
  });

  await prisma.userBook.upsert({
    where: {
      userId_bookId: { userId: bob.id, bookId: "book_atomic_habits" },
    },
    update: {
      status: ReadingStatus.DONE,
      rating: 4,
      favorite: false,
      notes: "Simple and actionable.",
    },
    create: {
      userId: bob.id,
      bookId: "book_atomic_habits",
      status: ReadingStatus.DONE,
      rating: 4,
      favorite: false,
      notes: "Simple and actionable.",
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
