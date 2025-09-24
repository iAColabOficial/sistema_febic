const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFEBIC7Areas() {
  console.log('Populando áreas FEBIC (7 áreas principais + subáreas)...\n');
  
  try {
    // Limpar dados existentes
    await prisma.areaConhecimento.deleteMany({});
    console.log('Dados anteriores removidos\n');
    
    // =================== NÍVEL 1: 7 ÁREAS PRINCIPAIS ===================
    console.log('Criando 7 áreas principais...');
    const areasPrincipais = [
      { id: 'EXATAS', sigla: 'EXATAS', nome: 'Ciências Exatas e da Terra', nivel: 1 },
      { id: 'BIOLOGICAS', sigla: 'BIOLOGICAS', nome: 'Ciências Biológicas', nivel: 1 },
      { id: 'ENGENHARIAS', sigla: 'ENGENHARIAS', nome: 'Engenharias', nivel: 1 },
      { id: 'SAUDE', sigla: 'SAUDE', nome: 'Ciências da Saúde', nivel: 1 },
      { id: 'AGRARIAS', sigla: 'AGRARIAS', nome: 'Ciências Agrárias', nivel: 1 },
      { id: 'SOCIAIS', sigla: 'SOCIAIS', nome: 'Ciências Sociais', nivel: 1 },
      { id: 'HUMANAS', sigla: 'HUMANAS', nome: 'Ciências Humanas', nivel: 1 }
    ];

    for (const area of areasPrincipais) {
      await prisma.areaConhecimento.create({ data: area });
      console.log(`   ✓ ${area.nome}`);
    }

    // =================== NÍVEL 2: SUBÁREAS ===================
    console.log('\nCriando subáreas...');
    const subareas = [
      // ===== CIÊNCIAS EXATAS E DA TERRA =====
      { sigla: 'MAT', nome: 'Matemática', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'EST', nome: 'Probabilidade e Estatística', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'CCP', nome: 'Ciência da Computação', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'AST', nome: 'Astronomia', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'FIS', nome: 'Física', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'QUI', nome: 'Química', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'GEO', nome: 'Geociências', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'OCE', nome: 'Oceanografia', nivel: 2, paiId: 'EXATAS' },

      // ===== CIÊNCIAS BIOLÓGICAS =====
      { sigla: 'BIG', nome: 'Biologia Geral', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'GEN', nome: 'Genética', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'BOT', nome: 'Botânica', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'ZOO', nome: 'Zoologia', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'ECL', nome: 'Ecologia', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'MOR', nome: 'Morfologia', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'FSL', nome: 'Fisiologia', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'BIQ', nome: 'Bioquímica', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'BFI', nome: 'Biofísica', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'FMC', nome: 'Farmacologia', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'IMU', nome: 'Imunologia', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'MIC', nome: 'Microbiologia', nivel: 2, paiId: 'BIOLOGICAS' },
      { sigla: 'PAR', nome: 'Parasitologia', nivel: 2, paiId: 'BIOLOGICAS' },

      // ===== ENGENHARIAS =====
      { sigla: 'CIV', nome: 'Engenharia Civil', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'MIN', nome: 'Engenharia de Minas', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'EMM', nome: 'Engenharia de Materiais e Metalúrgica', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'ELE', nome: 'Engenharia Elétrica', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'MEC', nome: 'Engenharia Mecânica', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'EQU', nome: 'Engenharia Química', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'EFL', nome: 'Engenharia Florestal', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'TRA', nome: 'Engenharia de Transportes', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'NAV', nome: 'Engenharia Naval e Oceânica', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'AER', nome: 'Engenharia Aeroespacial', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'NUC', nome: 'Engenharia Nuclear', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'EAG', nome: 'Engenharia Agrícola', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'EBM', nome: 'Engenharia Biomédica', nivel: 2, paiId: 'ENGENHARIAS' },
      { sigla: 'ROB', nome: 'Robótica e Inteligência Computacional', nivel: 2, paiId: 'ENGENHARIAS' },

      // ===== CIÊNCIAS DA SAÚDE =====
      { sigla: 'MED', nome: 'Medicina', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'ODO', nome: 'Odontologia', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'FAR', nome: 'Farmácia', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'ENF', nome: 'Enfermagem', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'NUT', nome: 'Nutrição', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'SCO', nome: 'Saúde Coletiva', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'FON', nome: 'Fonoaudiologia', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'FTO', nome: 'Fisioterapia e Terapia Ocupacional', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'EDF', nome: 'Educação Física', nivel: 2, paiId: 'SAUDE' },

      // ===== CIÊNCIAS AGRÁRIAS =====
      { sigla: 'AGR', nome: 'Agronomia', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'RFL', nome: 'Recursos Florestais e Engenharia Florestal', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'RPE', nome: 'Recursos Pesqueiros e Engenharia de Pesca', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'VET', nome: 'Medicina Veterinária', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'ZOT', nome: 'Zootecnia', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'CTA', nome: 'Ciência e Tecnologia de Alimentos', nivel: 2, paiId: 'AGRARIAS' },

      // ===== CIÊNCIAS SOCIAIS =====
      { sigla: 'DIR', nome: 'Direito', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'ADM', nome: 'Administração', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'ECO', nome: 'Economia', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'ARQ', nome: 'Arquitetura e Urbanismo', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'PLA', nome: 'Planejamento Urbano e Regional', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'DEM', nome: 'Demografia', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'CIN', nome: 'Ciência da Informação', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'MUS', nome: 'Museologia', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'COM', nome: 'Comunicação', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'SER', nome: 'Serviço Social', nivel: 2, paiId: 'SOCIAIS' },
      { sigla: 'TUR', nome: 'Turismo', nivel: 2, paiId: 'SOCIAIS' },

      // ===== CIÊNCIAS HUMANAS =====
      { sigla: 'FIL', nome: 'Filosofia', nivel: 2, paiId: 'HUMANAS' },
      { sigla: 'SOC', nome: 'Sociologia', nivel: 2, paiId: 'HUMANAS' },
      { sigla: 'ANT', nome: 'Antropologia', nivel: 2, paiId: 'HUMANAS' },
      { sigla: 'ARH', nome: 'Arqueologia', nivel: 2, paiId: 'HUMANAS' },
      { sigla: 'HIS', nome: 'História', nivel: 2, paiId: 'HUMANAS' },
      { sigla: 'GEH', nome: 'Geografia', nivel: 2, paiId: 'HUMANAS' },
      { sigla: 'PSI', nome: 'Psicologia', nivel: 2, paiId: 'HUMANAS' },
      { sigla: 'EDU', nome: 'Educação', nivel: 2, paiId: 'HUMANAS' },
      { sigla: 'CPO', nome: 'Ciência Política', nivel: 2, paiId: 'HUMANAS' },
      { sigla: 'TEO', nome: 'Teologia', nivel: 2, paiId: 'HUMANAS' }
    ];

    for (const area of subareas) {
      await prisma.areaConhecimento.create({ data: area });
    }
    console.log(`   ✓ ${subareas.length} subáreas criadas`);

    const totalAreas = areasPrincipais.length + subareas.length;
    
    console.log('\nSEED FEBIC 7 ÁREAS FINALIZADO!');
    console.log('=====================================');
    console.log(`Estatísticas:`);
    console.log(`   • ${areasPrincipais.length} Áreas Principais (Nível 1)`);
    console.log(`   • ${subareas.length} Subáreas (Nível 2)`);
    console.log(`   • ${totalAreas} TOTAL DE ÁREAS CRIADAS`);
    console.log('=====================================');
    
    console.log('\nEstrutura final:');
    console.log('   Nível 1: 7 áreas principais especificadas');
    console.log('   Nível 2: Subáreas de cada área principal');
    console.log('   Robótica e Astronomia incluídas');
    console.log('   Siglas únicas sem conflitos\n');
    
  } catch (error) {
    console.error('Erro ao popular áreas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o seed
seedFEBIC7Areas()
  .catch((error) => {
    console.error('Erro crítico:', error);
    process.exit(1);
  });