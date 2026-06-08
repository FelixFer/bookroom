import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/server-utils";

export const GET = async (request: Request) => {
  const userId = await requireAuth();
  if (!userId) return err("Unauthorized", 401);

  const labeledOnly = new URL(request.url).searchParams.get("labeled") === "true";

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId, ...(labeledOnly && { label: { not: null } }) },
    select: { slot: true, label: true },
    orderBy: { slot: "asc" },
  });

  return ok({ data: bookmarks });
};

export const PUT = async (request: Request) => {
  const userId = await requireAuth();
  if (!userId) return err("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as unknown;
  if (!Array.isArray(body)) return err("Invalid payload", 422);

  try {
    await Promise.all(
      body.map(({ slot, label }: { slot: number; label: string | null }) =>
        prisma.bookmark.upsert({
          where: { userId_slot: { userId, slot } },
          create: { userId, slot, label: label || null },
          update: { label: label || null },
        }),
      ),
    );
    return ok({ message: "Changes Saved" }, 201);
  } catch (e) {
    console.error(e);
    return err("Failed to save bookmarks", 500);
  }
};
