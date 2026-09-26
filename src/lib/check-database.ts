import { hasDatabase, query } from "@/lib/db";
import { redact, type DatabaseStatus } from "@/lib/health";

export async function checkDatabase(): Promise<DatabaseStatus> {
  if (!hasDatabase()) return { state: "not-configured" };

  const started = Date.now();
  try {
    await query("select 1");
    const latencyMs = Date.now() - started;
    // 마이그레이션을 한 번도 안 돌렸으면 테이블이 없다. 그것도 정상이다.
    const [row] = await query<{ count: string | null }>(
      "select case when to_regclass('schema_migrations') is null then null else (select count(*) from schema_migrations)::text end as count",
    );
    return { state: "ok", latencyMs, migrations: Number(row?.count ?? 0) };
  } catch (error) {
    return { state: "error", message: redact(error instanceof Error ? error.message : String(error)) };
  }
}
