import { getNewsSources, getCommunitySnapshot, synchronizeUsmeNews } from "../db";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

export const newsRouter = router({
  snapshot: protectedProcedure.query(() => getCommunitySnapshot()),
  sources: protectedProcedure.query(() => getNewsSources()),
  synchronizeNow: adminProcedure.mutation(() => synchronizeUsmeNews()),
});
