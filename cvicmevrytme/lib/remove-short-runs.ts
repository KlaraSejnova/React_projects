import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export async function removeShortRuns(
  client: SupabaseClient<Database>,
  userId: string,
  ids: string[],
): Promise<{ deletedIds: string[]; error?: string }> {
  const deletedIds: string[] = [];
  try {
    for (let index = 0; index < ids.length; index += 100) {
      const batch = ids.slice(index, index + 100);
      const { data, error } = await client.from("runs")
        .delete()
        .eq("user_id", userId)
        .in("id", batch)
        .filter("run->distanceKm", "lte", "3")
        .select("id");
      if (error) throw new Error(error.message);
      deletedIds.push(...data.map((row) => row.id));
      if (data.length !== batch.length) {
        throw new Error("Některé záznamy se mezitím změnily nebo jejich odstranění nelze ověřit. Obnov stránku a zkus to znovu.");
      }
    }
    return { deletedIds };
  } catch (error) {
    return { deletedIds, error: error instanceof Error ? error.message : "Neznámá chyba." };
  }
}
