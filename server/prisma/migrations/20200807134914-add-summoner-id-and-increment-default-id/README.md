# Migration `20200807134914-add-summoner-id-and-increment-default-id`

This migration has been generated by Donny Roufs at 8/7/2020, 1:49:14 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE SEQUENCE "summoner_id_seq";;
ALTER TABLE "public"."Summoner" ADD COLUMN "accountId" text  NOT NULL ,
ALTER COLUMN "id" SET DEFAULT nextval('summoner_id_seq');;;
ALTER SEQUENCE "summoner_id_seq" OWNED BY "public"."Summoner"."id";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200807131857-add-region-to-summoner..20200807134914-add-summoner-id-and-increment-default-id
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
   provider = "prisma-client-js"
@@ -28,15 +28,16 @@
   matchupId Int?
 }
 model Summoner {
-  id       Int       @id
-  name     String
-  level    Int
-  Matchups Matchup[]
-  user     User      @relation(fields: [user_id], references: [id])
-  user_id  Int
-  region   String    @default("euw")
+  id        Int       @id @default(autoincrement())
+  accountId String
+  name      String
+  level     Int
+  Matchups  Matchup[]
+  user      User      @relation(fields: [user_id], references: [id])
+  user_id   Int
+  region    String    @default("euw")
 }
 model Matchup {
   id           Int       @id @default(autoincrement())
```

