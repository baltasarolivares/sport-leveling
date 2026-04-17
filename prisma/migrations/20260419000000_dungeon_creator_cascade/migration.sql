-- Al borrar un usuario, sus dungeons creadas (y en cascada, sus participantes)
-- ahora se eliminan automáticamente. Antes la FK era RESTRICT, lo que impedía
-- borrar usuarios con dungeons y dejaba data huérfana si se forzaba el borrado.

-- DropForeignKey
ALTER TABLE "dungeons" DROP CONSTRAINT "dungeons_creatorId_fkey";

-- AddForeignKey
ALTER TABLE "dungeons" ADD CONSTRAINT "dungeons_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
