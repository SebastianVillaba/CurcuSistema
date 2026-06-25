import fs from 'fs';
import path from 'path';
import { executeRequest } from '../utils/dbHandler';

async function runMigration() {
  console.log('🚀 Iniciando migración de base de datos para el Módulo de Distribución...');
  try {
    const sqlFilePath = path.join(process.cwd(), 'src', 'database', 'migrar_distribucion.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Dividir el archivo por la palabra clave "GO" en su propia línea
    // Esto es necesario porque CREATE PROCEDURE debe ser el primer comando en un lote (batch)
    const batches = sqlContent
      .split(/^\s*GO\s*$/mi)
      .map(batch => batch.trim())
      .filter(batch => batch.length > 0);

    console.log(`⏳ Se encontraron ${batches.length} lotes SQL para ejecutar...`);

    for (let i = 0; i < batches.length; i++) {
      console.log(`   [${i + 1}/${batches.length}] Ejecutando lote...`);
      await executeRequest({
        query: batches[i],
        isStoredProcedure: false
      });
    }

    console.log('✅ Migración ejecutada con éxito en la base de datos.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración de la base de datos:', error);
    process.exit(1);
  }
}

runMigration();
