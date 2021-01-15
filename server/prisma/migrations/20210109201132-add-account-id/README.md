# Migration `20210109201132-add-account-id`

This migration has been generated by Donny Roufs at 1/9/2021, 9:11:32 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Summoner" ADD COLUMN "summonerId" text   ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210107122038-add-dates-to-game-table..20210109201132-add-account-id
--- datamodel.dml
+++ datamodel.dml
@@ -2,9 +2,9 @@
 // learn more about it in the docs: https://pris.ly/d/prisma-schema
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider        = "prisma-client-js"
@@ -28,17 +28,18 @@
   User_reset_password User_reset_password[]
 }
 model Summoner {
-  id        Int      @id @default(autoincrement())
-  accountId String
-  name      String
-  level     Int
-  region    String   @default("euw")
-  user_id   Int?
-  user      User?    @relation(fields: [user_id], references: [id])
-  createdAt DateTime @default(now())
-  updatedAt DateTime @updatedAt
+  id         Int      @id @default(autoincrement())
+  accountId  String // summonerId 
+  summonerId String? // accountId
+  name       String
+  level      Int
+  region     String   @default("euw")
+  user_id    Int?
+  user       User?    @relation(fields: [user_id], references: [id])
+  createdAt  DateTime @default(now())
+  updatedAt  DateTime @updatedAt
 }
 model Game {
   user_id   Int
```

