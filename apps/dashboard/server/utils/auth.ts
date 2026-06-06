import type { H3Event } from "h3";
import { eq } from "drizzle-orm";
import { schema, useDb } from "../database";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | undefined;
  workspaceId: string;
}

declare module "#auth-utils" {
  interface User extends SessionUser {}
}

export async function ensureUserWorkspace(user: {
  id: string;
  email: string;
  name?: string;
}): Promise<SessionUser> {
  const db = useDb();
  const [existing] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, user.email))
    .limit(1);

  if (existing) {
    const [membership] = await db
      .select()
      .from(schema.workspaceMembers)
      .where(eq(schema.workspaceMembers.userId, existing.id))
      .limit(1);
    if (!membership) {
      throw createError({ statusCode: 500, statusMessage: "User has no workspace" });
    }
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name ?? undefined,
      workspaceId: membership.workspaceId,
    };
  }

  const [createdUser] = await db
    .insert(schema.users)
    .values({
      email: user.email,
      name: user.name,
      oauthProvider: "github",
    })
    .returning();

  const [workspace] = await db
    .insert(schema.workspaces)
    .values({
      name: `${user.name ?? user.email}'s workspace`,
      ownerId: createdUser!.id,
    })
    .returning();

  await db.insert(schema.workspaceMembers).values({
    workspaceId: workspace!.id,
    userId: createdUser!.id,
    role: "owner",
  });

  return {
    id: createdUser!.id,
    email: createdUser!.email,
    name: createdUser!.name ?? undefined,
    workspaceId: workspace!.id,
  };
}

export async function requireSessionUser(event: H3Event): Promise<SessionUser> {
  const session = await getUserSession(event);
  if (!session.user?.workspaceId) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return session.user as SessionUser;
}
