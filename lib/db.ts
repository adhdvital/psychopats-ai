import { init, id, tx, lookup } from "@instantdb/admin";

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

export { db, id, tx, lookup };
