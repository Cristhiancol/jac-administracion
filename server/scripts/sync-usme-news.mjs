import { synchronizeUsmeNews } from "../db.ts";

const result = await synchronizeUsmeNews();
console.log(JSON.stringify(result));
