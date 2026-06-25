import { executeRequest } from '../utils/dbHandler';

async function main() {
  try {
    console.log('Querying client and persona data for ID/code 1443...');
    
    // Buscar en cliente por idCliente, codigo o idPersona
    const result = await executeRequest({
      query: `
        SELECT * FROM cliente 
        WHERE idCliente = 1443 OR codigo = 1443 OR idPersona = 1443
      `,
      isStoredProcedure: false
    });
    
    console.log('--- CLIENTE RECORDS FOUND ---');
    console.log(result.recordset);
    
    if (result.recordset.length > 0) {
      const idPersona = result.recordset[0].idPersona;
      const personaResult = await executeRequest({
        query: `SELECT * FROM persona WHERE idPersona = ${idPersona}`,
        isStoredProcedure: false
      });
      console.log('--- PERSONA RECORD FOUND ---');
      console.log(personaResult.recordset);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
