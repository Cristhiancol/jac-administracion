import type { Request, Response } from "express";
import { getNewsSourceByTaskUid, synchronizeUsmeNews } from "../db";
import { sdk } from "../_core/sdk";

export async function synchronizeOfficialNewsHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }
    const source = await getNewsSourceByTaskUid(user.taskUid);
    if (!source) {
      return res.json({ ok: true, skipped: "orphan" });
    }
    const result = await synchronizeUsmeNews(source.id);
    return res.json({ ok: true, sourceId: source.id, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message, context: { path: req.path }, timestamp: new Date().toISOString() });
  }
}
