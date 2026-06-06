import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function useDb() {
  const config = useRuntimeConfig();
  const url = config.databaseUrl;
  if (!url) {
    throw createError({
      statusCode: 500,
      statusMessage: "DATABASE_URL is not configured",
    });
  }

  if (!client) {
    client = postgres(url, { max: 10 });
    db = drizzle(client, { schema });
  }

  return db!;
}

export { schema };
