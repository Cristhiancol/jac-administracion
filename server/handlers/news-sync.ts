import type { Request, Response } from "express";
import { synchronizeUsmeNews } from "../db";

export async function synchronizeOfficialNewsHandler(req: Request, res: Response) {
  try {
    const result = await synchronizeUsmeNews();
    res.json({ ok: true, imported: result.imported });
  } catch (error: any) {
    console.error("Failed to synchronize official news:", error);
    res.status(500).json({ ok: false, error: error?.message || "Internal server error" });
  }
}
