const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAreasCNPq() {
  console.log('🌱 Populando áreas do conhecimento CNPq completas...');
  
  const areas = [
    // ===== GRANDES ÁREAS =====
    { sigla: 'EXT', nome: 'Ciências Exatas e da Terra', nivel: 1 },
    { sigla: 'BIO', nome: 'Ciências Biológicas', nivel: 1 },
    { sigla: 'ENG', nome: 'Engenharias', nivel: 1 },
    { sigla: 'SAU', nome: 'Ciências da Saúde', nivel: 1 },
    { sigla: 'AGR', nome: 'Ciências Agrárias', nivel: 1 },
    { sigla: 'SOC', nome: 'Ciências Sociais Aplicadas', nivel: 1 },
    { sigla: 'HUM', nome: 'Ciências Humanas', nivel: 1 },
    { sigla: 'LLA', nome: 'Linguística, Letras e Artes', nivel: 1 },
    { sigla: 'OUT', nome: 'Outros', nivel: 1 },

    // ===== CIÊNCIAS EXATAS E DA TERRA =====
    { sigla: 'MAT', nome: 'Matemática', nivel: 2, paiId: 'EXT' },
    { sigla: 'EST', nome: 'Probabilidade e Estatística', nivel: 2, paiId: 'EXT' },
    { sigla: 'CCP', nome: 'Ciência da Computação', nivel: 2, paiId: 'EXT' },
    { sigla: 'AST', nome: 'Astronomia', nivel: 2, paiId: 'EXT' },
    { sigla: 'FIS', nome: 'Física', nivel: 2, paiId: 'EXT' },
    { sigla: 'QUI', nome: 'Química', nivel: 2, paiId: 'EXT' },
    { sigla: 'GEO', nome: 'Geociências', nivel: 2, paiId: 'EXT' },
    { sigla: 'OCE', nome: 'Oceanografia', nivel: 2, paiId: 'EXT' },

    // Matemática - Subáreas
    { sigla: 'MAA', nome: 'Álgebra', nivel: 3, paiId: 'MAT' },
    { sigla: 'MAN', nome: 'Análise', nivel: 3, paiId: 'MAT' },
    { sigla: 'MAG', nome: 'Geometria e Topologia', nivel: 3, paiId: 'MAT' },
    { sigla: 'MAM', nome: 'Matemática Aplicada', nivel: 3, paiId: 'MAT' },

    // Física - Subáreas
    { sigla: 'FIG', nome: 'Física Geral', nivel: 3, paiId: 'FIS' },
    { sigla: 'FIM', nome: 'Física da Matéria Condensada', nivel: 3, paiId: 'FIS' },
    { sigla: 'FIA', nome: 'Física Atômica e Molecular', nivel: 3, paiId: 'FIS' },
    { sigla: 'FIN', nome: 'Física Nuclear', nivel: 3, paiId: 'FIS' },
    { sigla: 'FIP', nome: 'Física de Partículas e Campos', nivel: 3, paiId: 'FIS' },

    // Química - Subáreas
    { sigla: 'QUA', nome: 'Química Analítica', nivel: 3, paiId: 'QUI' },
    { sigla: 'QUI', nome: 'Química Inorgânica', nivel: 3, paiId: 'QUI' },
    { sigla: 'QUO', nome: 'Química Orgânica', nivel: 3, paiId: 'QUI' },
    { sigla: 'QUF', nome: 'Físico-Química', nivel: 3, paiId: 'QUI' },
    { sigla: 'QUP', nome: 'Química de Polímeros', nivel: 3, paiId: 'QUI' },

    // Ciência da Computação - Subáreas
    { sigla: 'CCA', nome: 'Teoria da Computação', nivel: 3, paiId: 'CCP' },
    { sigla: 'CCM', nome: 'Metodologia e Técnicas da Computação', nivel: 3, paiId: 'CCP' },
    { sigla: 'CCS', nome: 'Sistemas de Computação', nivel: 3, paiId: 'CCP' },
    { sigla: 'CCM', nome: 'Matemática da Computação', nivel: 3, paiId: 'CCP' },

    // ===== CIÊNCIAS BIOLÓGICAS =====
    { sigla: 'BGE', nome: 'Biologia Geral', nivel: 2, paiId: 'BIO' },
    { sigla: 'GEN', nome: 'Genética', nivel: 2, paiId: 'BIO' },
    { sigla: 'BOT', nome: 'Botânica', nivel: 2, paiId: 'BIO' },
    { sigla: 'ZOO', nome: 'Zoologia', nivel: 2, paiId: 'BIO' },
    { sigla: 'ECO', nome: 'Ecologia', nivel: 2, paiId: 'BIO' },
    { sigla: 'MOR', nome: 'Morfologia', nivel: 2, paiId: 'BIO' },
    { sigla: 'FSI', nome: 'Fisiologia', nivel: 2, paiId: 'BIO' },
    { sigla: 'BQU', nome: 'Bioquímica', nivel: 2, paiId: 'BIO' },
    { sigla: 'BFI', nome: 'Biofísica', nivel: 2, paiId: 'BIO' },
    { sigla: 'FAR', nome: 'Farmacologia', nivel: 2, paiId: 'BIO' },
    { sigla: 'IMU', nome: 'Imunologia', nivel: 2, paiId: 'BIO' },
    { sigla: 'MIC', nome: 'Microbiologia', nivel: 2, paiId: 'BIO' },
    { sigla: 'PAR', nome: 'Parasitologia', nivel: 2, paiId: 'BIO' },

    // ===== ENGENHARIAS =====
    { sigla: 'CIV', nome: 'Engenharia Civil', nivel: 2, paiId: 'ENG' },
    { sigla: 'MIN', nome: 'Engenharia de Minas', nivel: 2, paiId: 'ENG' },
    { sigla: 'MAT', nome: 'Engenharia de Materiais e Metalúrgica', nivel: 2, paiId: 'ENG' },
    { sigla: 'ELE', nome: 'Engenharia Elétrica', nivel: 2, paiId: 'ENG' },
    { sigla: 'MEC', nome: 'Engenharia Mecânica', nivel: 2, paiId: 'ENG' },
    { sigla: 'EQU', nome: 'Engenharia Química', nivel: 2, paiId: 'ENG' },
    { sigla: 'SAN', nome: 'Engenharia Sanitária', nivel: 2, paiId: 'ENG' },
    { sigla: 'PRO', nome: 'Engenharia de Produção', nivel: 2, paiId: 'ENG' },
    { sigla: 'NUC', nome: 'Engenharia Nuclear', nivel: 2, paiId: 'ENG' },
    { sigla: 'TRA', nome: 'Engenharia de Transportes', nivel: 2, paiId: 'ENG' },
    { sigla: 'NAV', nome: 'Engenharia Naval e Oceânica', nivel: 2, paiId: 'ENG' },
    { sigla: 'AER', nome: 'Engenharia Aeroespacial', nivel: 2, paiId: 'ENG' },
    { sigla: 'BIO', nome: 'Engenharia Biomédica', nivel: 2, paiId: 'ENG' },

    // ===== CIÊNCIAS DA SAÚDE =====
    { sigla: 'MED', nome: 'Medicina', nivel: 2, paiId: 'SAU' },
    { sigla: 'ODO', nome: 'Odontologia', nivel: 2, paiId: 'SAU' },
    { sigla: 'FAR', nome: 'Farmácia', nivel: 2, paiId: 'SAU' },
    { sigla: 'ENF', nome: 'Enfermagem', nivel: 2, paiId: 'SAU' },
    { sigla: 'NUT', nome: 'Nutrição', nivel: 2, paiId: 'SAU' },
    { sigla: 'SAP', nome: 'Saúde Coletiva', nivel: 2, paiId: 'SAU' },
    { sigla: 'FON', nome: 'Fonoaudiologia', nivel: 2, paiId: 'SAU' },
    { sigla: 'FIS', nome: 'Fisioterapia e Terapia Ocupacional', nivel: 2, paiId: 'SAU' },
    { sigla: 'EDF', nome: 'Educação Física', nivel: 2, paiId: 'SAU' },

    // ===== CIÊNCIAS AGRÁRIAS =====
    { sigla: 'AGR', nome: 'Agronomia', nivel: 2, paiId: 'AGR' },
    { sigla: 'REC', nome: 'Recursos Florestais e Engenharia Florestal', nivel: 2, paiId: 'AGR' },
    { sigla: 'PEC', nome: 'Zootecnia', nivel: 2, paiId: 'AGR' },
    { sigla: 'VET', nome: 'Medicina Veterinária', nivel: 2, paiId: 'AGR' },
    { sigla: 'REC', nome: 'Recursos Pesqueiros e Engenharia de Pesca', nivel: 2, paiId: 'AGR' },
    { sigla: 'CTA', nome: 'Ciência e Tecnologia de Alimentos', nivel: 2, paiId: 'AGR' },

    // ===== CIÊNCIAS SOCIAIS APLICADAS =====
    { sigla: 'DIR', nome: 'Direito', nivel: 2, paiId: 'SOC' },
    { sigla: 'ADM', nome: 'Administração', nivel: 2, paiId: 'SOC' },
    { sigla: 'ECO', nome: 'Economia', nivel: 2, paiId: 'SOC' },
    { sigla: 'ARQ', nome: 'Arquitetura e Urbanismo', nivel: 2, paiId: 'SOC' },
    { sigla: 'PLN', nome: 'Planejamento Urbano e Regional', nivel: 2, paiId: 'SOC' },
    { sigla: 'DEM', nome: 'Demografia', nivel: 2, paiId: 'SOC' },
    { sigla: 'CIN', nome: 'Ciência da Informação', nivel: 2, paiId: 'SOC' },
    { sigla: 'MCS', nome: 'Museologia', nivel: 2, paiId: 'SOC' },
    { sigla: 'COM', nome: 'Comunicação', nivel: 2, paiId: 'SOC' },
    { sigla: 'SER', nome: 'Serviço Social', nivel: 2, paiId: 'SOC' },
    { sigla: 'ECO', nome: 'Economia Doméstica', nivel: 2, paiId: 'SOC' },
    { sigla: 'DES', nome: 'Desenho Industrial', nivel: 2, paiId: 'SOC' },
    { sigla: 'TUR', nome: 'Turismo', nivel: 2, paiId: 'SOC' },

    // ===== CIÊNCIAS HUMANAS =====
    { sigla: 'FIL', nome: 'Filosofia', nivel: 2, paiId: 'HUM' },
    { sigla: 'SOC', nome: 'Sociologia', nivel: 2, paiId: 'HUM' },
    { sigla: 'ANT', nome: 'Antropologia', nivel: 2, paiId: 'HUM' },
    { sigla: 'ARQ', nome: 'Arqueologia', nivel: 2, paiId: 'HUM' },
    { sigla: 'HIS', nome: 'História', nivel: 2, paiId: 'HUM' },
    { sigla: 'GEO', nome: 'Geografia', nivel: 2, paiId: 'HUM' },
    { sigla: 'PSI', nome: 'Psicologia', nivel: 2, paiId: 'HUM' },
    { sigla: 'EDU', nome: 'Educação', nivel: 2, paiId: 'HUM' },
    { sigla: 'CIP', nome: 'Ciência Política', nivel: 2, paiId: 'HUM' },
    { sigla: 'TEO', nome: 'Teologia', nivel: 2, paiId: 'HUM' },

    // ===== LINGUÍSTICA, LETRAS E ARTES =====
    { sigla: 'LIN', nome: 'Linguística', nivel: 2, paiId: 'LLA' },
    { sigla: 'LET', nome: 'Letras', nivel: 2, paiId: 'LLA' },
    { sigla: 'ART', nome: 'Artes', nivel: 2, paiId: 'LLA' },

    // Letras - Subáreas
    { sigla: 'LLP', nome: 'Língua Portuguesa', nivel: 3, paiId: 'LET' },
    { sigla: 'LLE', nome: 'Línguas Estrangeiras Modernas', nivel: 3, paiId: 'LET' },
    { sigla: 'LLC', nome: 'Línguas Clássicas', nivel: 3, paiId: 'LET' },
    { sigla: 'LLB', nome: 'Línguas Indígenas', nivel: 3, paiId: 'LET' },

    // Artes - Subáreas
    { sigla: 'AFP', nome: 'Fundamentos e Crítica das Artes', nivel: 3, paiId: 'ART' },
    { sigla: 'AVI', nome: 'Artes Visuais', nivel: 3, paiId: 'ART' },
    { sigla: 'MUS', nome: 'Música', nivel: 3, paiId: 'ART' },
    { sigla: 'TEA', nome: 'Teatro', nivel: 3, paiId: 'ART' },
    { sigla: 'DAN', nome: 'Dança', nivel: 3, paiId: 'ART' },
    { sigla: 'CIN', nome: 'Cinema', nivel: 3, paiId: 'ART' },

    // Subáreas específicas para Educação (mais detalhadas)
    { sigla: 'EFU', nome: 'Fundamentos da Educação', nivel: 3, paiId: 'EDU' },
    { sigla: 'EAD', nome: 'Administração Educacional', nivel: 3, paiId: 'EDU' },
    { sigla: 'EPL', nome: 'Planejamento e Avaliação Educacional', nivel: 3, paiId: 'EDU' },
    { sigla: 'EEN', nome: 'Ensino-Aprendizagem', nivel: 3, paiId: 'EDU' },
    { sigla: 'ECU', nome: 'Currículo', nivel: 3, paiId: 'EDU' },
    { sigla: 'EOR', nome: 'Orientação e Aconselhamento', nivel: 3, paiId: 'EDU' },
    { sigla: 'EEI', nome: 'Educação de Adultos', nivel: 3, paiId: 'EDU' },
    { sigla: 'EES', nome: 'Educação Especial', nivel: 3, paiId: 'EDU' },
    { sigla: 'ETE', nome: 'Tecnologia Educacional', nivel: 3, paiId: 'EDU' },
    { sigla: 'EEA', nome: 'Educação a Distância', nivel: 3, paiId: 'EDU' }
  ];

  try {
    let count = 0;
    // Usar upsert para não duplicar se executar várias vezes
    for (const area of areas) {
      await prisma.areaConhecimento.upsert({
        where: { sigla: area.sigla },
        update: {},
        create: area
      });
      count++;
      
      if (count % 20 === 0) {
        console.log(`✅ ${count} áreas processadas...`);
      }
    }

    console.log(`✅ ${count} áreas do conhecimento CNPq populadas com sucesso!`);
    console.log('📊 Estrutura criada:');
    console.log('   • 9 grandes áreas');
    console.log('   • ~60 áreas específicas');  
    console.log('   • ~40 subáreas detalhadas');
    
  } catch (error) {
    console.error('❌ Erro ao popular áreas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAreasCNPq();