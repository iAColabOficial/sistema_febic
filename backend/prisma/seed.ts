// backend/prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// =================== SEED DE ÁREAS DO CONHECIMENTO ===================
async function seedAreas() {
  console.log('🌱 Populando áreas FEBIC (7 áreas principais + subáreas)...\n');
  
  try {
    // Limpar dados existentes
    await prisma.areaConhecimento.deleteMany({});
    console.log('✅ Dados anteriores de áreas removidos\n');
    
    // NÍVEL 1: 7 ÁREAS PRINCIPAIS
    console.log('📚 Criando 7 áreas principais...');
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

    // NÍVEL 2: SUBÁREAS
    console.log('\n📖 Criando subáreas...');
    const subareas = [
      // CIÊNCIAS EXATAS E DA TERRA
      { sigla: 'MAT', nome: 'Matemática', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'EST', nome: 'Probabilidade e Estatística', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'CCP', nome: 'Ciência da Computação', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'AST', nome: 'Astronomia', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'FIS', nome: 'Física', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'QUI', nome: 'Química', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'GEO', nome: 'Geociências', nivel: 2, paiId: 'EXATAS' },
      { sigla: 'OCE', nome: 'Oceanografia', nivel: 2, paiId: 'EXATAS' },

      // CIÊNCIAS BIOLÓGICAS
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

      // ENGENHARIAS
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

      // CIÊNCIAS DA SAÚDE
      { sigla: 'MED', nome: 'Medicina', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'ODO', nome: 'Odontologia', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'FAR', nome: 'Farmácia', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'ENF', nome: 'Enfermagem', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'NUT', nome: 'Nutrição', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'SCO', nome: 'Saúde Coletiva', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'FON', nome: 'Fonoaudiologia', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'FTO', nome: 'Fisioterapia e Terapia Ocupacional', nivel: 2, paiId: 'SAUDE' },
      { sigla: 'EDF', nome: 'Educação Física', nivel: 2, paiId: 'SAUDE' },

      // CIÊNCIAS AGRÁRIAS
      { sigla: 'AGR', nome: 'Agronomia', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'RFL', nome: 'Recursos Florestais e Engenharia Florestal', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'RPE', nome: 'Recursos Pesqueiros e Engenharia de Pesca', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'VET', nome: 'Medicina Veterinária', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'ZOT', nome: 'Zootecnia', nivel: 2, paiId: 'AGRARIAS' },
      { sigla: 'CTA', nome: 'Ciência e Tecnologia de Alimentos', nivel: 2, paiId: 'AGRARIAS' },

      // CIÊNCIAS SOCIAIS
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

      // CIÊNCIAS HUMANAS
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
    
    console.log('\n✅ ÁREAS CRIADAS COM SUCESSO!');
    console.log(`   • ${areasPrincipais.length} Áreas Principais`);
    console.log(`   • ${subareas.length} Subáreas`);
    console.log(`   • ${totalAreas} TOTAL DE ÁREAS\n`);
    
  } catch (error) {
    console.error('❌ Erro ao popular áreas:', error);
    throw error;
  }
}

// =================== SEED DE USUÁRIOS ===================
async function seedUsers() {
  console.log('👥 Populando usuários...\n');

  const passwordHash = await bcrypt.hash('123456', 10);

  try {
    // Limpar usuários existentes (cuidado em produção!)
    // await prisma.user.deleteMany({});
    // console.log('✅ Dados anteriores de usuários removidos\n');

    const usuarios = [
      // 1. ADMINISTRADOR
      {
        email: 'admin@febic.com.br',
        name: 'Administrador FEBIC',
        cpf: '111.111.111-11',
        phone: '(47) 99999-0001',
        birthDate: new Date('1985-01-15'),
        gender: 'Masculino',
        address: 'Rua Principal, 1000',
        neighborhood: 'Centro',
        city: 'Jaraguá do Sul',
        state: 'SC',
        zipCode: '89250-000',
        institution: 'IBIC',
        position: 'Diretor Geral',
        formation: 'Doutor em Administração',
        role: UserRole.ADMINISTRADOR,
      },
      
      // 2. COORDENADOR
      {
        email: 'coordenador@febic.com.br',
        name: 'Dr. Carlos Silva',
        cpf: '222.222.222-22',
        phone: '(47) 99999-0002',
        birthDate: new Date('1980-03-20'),
        gender: 'Masculino',
        address: 'Avenida Central, 500',
        neighborhood: 'Vila Nova',
        city: 'Jaraguá do Sul',
        state: 'SC',
        zipCode: '89251-000',
        institution: 'IBIC',
        position: 'Coordenador de Avaliações',
        formation: 'Doutor em Educação',
        role: UserRole.COORDENADOR_AVALIACOES,
      },

      // 3-7. AVALIADORES
      {
        email: 'maria.santos@febic.com.br',
        name: 'Profª. Dra. Maria Santos',
        cpf: '333.333.333-33',
        phone: '(47) 99999-1001',
        birthDate: new Date('1975-05-10'),
        gender: 'Feminino',
        address: 'Rua das Flores, 123',
        neighborhood: 'Jardim Europa',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        institution: 'USP',
        position: 'Professora Titular',
        formation: 'Doutora em Física',
        role: UserRole.AVALIADOR,
      },
      {
        email: 'joao.oliveira@febic.com.br',
        name: 'Prof. Dr. João Oliveira',
        cpf: '444.444.444-44',
        phone: '(21) 99999-2001',
        birthDate: new Date('1978-08-22'),
        gender: 'Masculino',
        address: 'Avenida Atlântica, 456',
        neighborhood: 'Copacabana',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '22021-001',
        institution: 'UFRJ',
        position: 'Professor Associado',
        formation: 'Doutor em Química',
        role: UserRole.AVALIADOR,
      },
      {
        email: 'ana.costa@febic.com.br',
        name: 'Profª. Dra. Ana Paula Costa',
        cpf: '555.555.555-55',
        phone: '(31) 99999-3001',
        birthDate: new Date('1982-11-15'),
        gender: 'Feminino',
        address: 'Rua dos Inconfidentes, 789',
        neighborhood: 'Savassi',
        city: 'Belo Horizonte',
        state: 'MG',
        zipCode: '30140-120',
        institution: 'UFMG',
        position: 'Professora Adjunta',
        formation: 'Doutora em Biologia',
        role: UserRole.AVALIADOR,
      },
      {
        email: 'roberto.lima@febic.com.br',
        name: 'Prof. Dr. Roberto Lima',
        cpf: '666.666.666-66',
        phone: '(41) 99999-4001',
        birthDate: new Date('1979-02-28'),
        gender: 'Masculino',
        address: 'Rua XV de Novembro, 321',
        neighborhood: 'Centro',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80020-310',
        institution: 'UFPR',
        position: 'Professor Associado',
        formation: 'Doutor em Matemática',
        role: UserRole.AVALIADOR,
      },
      {
        email: 'juliana.ferreira@febic.com.br',
        name: 'Profª. Dra. Juliana Ferreira',
        cpf: '777.777.777-77',
        phone: '(51) 99999-5001',
        birthDate: new Date('1984-07-05'),
        gender: 'Feminino',
        address: 'Avenida Independência, 654',
        neighborhood: 'Cidade Baixa',
        city: 'Porto Alegre',
        state: 'RS',
        zipCode: '90035-000',
        institution: 'UFRGS',
        position: 'Professora Adjunta',
        formation: 'Doutora em Engenharia',
        role: UserRole.AVALIADOR,
      },

      // 8-10. ORIENTADORES
      {
        email: 'fernando.alves@escola.com.br',
        name: 'Prof. Fernando Alves',
        cpf: '888.888.888-88',
        phone: '(47) 99999-6001',
        birthDate: new Date('1988-04-12'),
        gender: 'Masculino',
        address: 'Rua das Palmeiras, 111',
        neighborhood: 'Barra do Rio',
        city: 'Jaraguá do Sul',
        state: 'SC',
        zipCode: '89252-000',
        institution: 'Colégio Estadual SC',
        position: 'Professor de Ciências',
        formation: 'Mestre em Educação',
        role: UserRole.ORIENTADOR,
      },
      {
        email: 'carla.mendes@escola.com.br',
        name: 'Profª. Carla Mendes',
        cpf: '999.999.999-99',
        phone: '(47) 99999-7001',
        birthDate: new Date('1990-09-18'),
        gender: 'Feminino',
        address: 'Avenida Getúlio Vargas, 222',
        neighborhood: 'Barra Velha',
        city: 'Joinville',
        state: 'SC',
        zipCode: '89220-000',
        institution: 'Escola Municipal JP II',
        position: 'Professora de Biologia',
        formation: 'Especialista em Biologia',
        role: UserRole.ORIENTADOR,
      },
      {
        email: 'marcelo.rocha@escola.com.br',
        name: 'Prof. Marcelo Rocha',
        cpf: '101.101.101-01',
        phone: '(47) 99999-8001',
        birthDate: new Date('1986-12-25'),
        gender: 'Masculino',
        address: 'Rua Blumenau, 333',
        neighborhood: 'Centro',
        city: 'Blumenau',
        state: 'SC',
        zipCode: '89010-000',
        institution: 'IFSC',
        position: 'Professor de Física',
        formation: 'Mestre em Física',
        role: UserRole.ORIENTADOR,
      },

      // 11-16. AUTORES
      {
        email: 'pedro.silva@estudante.com',
        name: 'Pedro Henrique Silva',
        cpf: '121.212.121-21',
        phone: '(47) 99999-9001',
        birthDate: new Date('2007-03-15'),
        gender: 'Masculino',
        address: 'Rua dos Estudantes, 100',
        neighborhood: 'Vila Rau',
        city: 'Jaraguá do Sul',
        state: 'SC',
        zipCode: '89253-000',
        institution: 'Colégio Estadual SC',
        position: 'Estudante',
        formation: 'Ensino Médio',
        role: UserRole.AUTOR,
      },
      {
        email: 'julia.santos@estudante.com',
        name: 'Julia Ferreira Santos',
        cpf: '131.313.131-31',
        phone: '(47) 99999-9002',
        birthDate: new Date('2006-07-20'),
        gender: 'Feminino',
        address: 'Avenida Marechal Deodoro, 200',
        neighborhood: 'Centro',
        city: 'Jaraguá do Sul',
        state: 'SC',
        zipCode: '89251-100',
        institution: 'Colégio Estadual SC',
        position: 'Estudante',
        formation: 'Ensino Médio',
        role: UserRole.AUTOR,
      },
      {
        email: 'lucas.costa@estudante.com',
        name: 'Lucas Oliveira Costa',
        cpf: '141.414.141-41',
        phone: '(47) 99999-9003',
        birthDate: new Date('2008-11-10'),
        gender: 'Masculino',
        address: 'Rua Reinoldo Rau, 300',
        neighborhood: 'Ilha da Figueira',
        city: 'Jaraguá do Sul',
        state: 'SC',
        zipCode: '89254-000',
        institution: 'Escola Municipal JP II',
        position: 'Estudante',
        formation: 'Ensino Fundamental',
        role: UserRole.AUTOR,
      },
      {
        email: 'beatriz.souza@estudante.com',
        name: 'Beatriz Lima Souza',
        cpf: '151.515.151-51',
        phone: '(47) 99999-9004',
        birthDate: new Date('2007-05-28'),
        gender: 'Feminino',
        address: 'Rua Walter Marquardt, 400',
        neighborhood: 'Barra do Rio Molha',
        city: 'Jaraguá do Sul',
        state: 'SC',
        zipCode: '89255-000',
        institution: 'Colégio Estadual SC',
        position: 'Estudante',
        formation: 'Ensino Médio',
        role: UserRole.AUTOR,
      },
      {
        email: 'gabriel.rocha@estudante.com',
        name: 'Gabriel Almeida Rocha',
        cpf: '161.616.161-61',
        phone: '(47) 99999-9005',
        birthDate: new Date('2006-09-14'),
        gender: 'Masculino',
        address: 'Rua Jorge Czerniewicz, 500',
        neighborhood: 'Czerniewicz',
        city: 'Jaraguá do Sul',
        state: 'SC',
        zipCode: '89256-000',
        institution: 'IFSC',
        position: 'Estudante',
        formation: 'Ensino Médio Técnico',
        role: UserRole.AUTOR,
      },
      {
        email: 'maria.martins@estudante.com',
        name: 'Maria Eduarda Martins',
        cpf: '171.717.171-71',
        phone: '(47) 99999-9006',
        birthDate: new Date('2008-01-22'),
        gender: 'Feminino',
        address: 'Rua Bernardo Dornbusch, 600',
        neighborhood: 'Baependi',
        city: 'Jaraguá do Sul',
        state: 'SC',
        zipCode: '89257-000',
        institution: 'Escola Municipal JP II',
        position: 'Estudante',
        formation: 'Ensino Fundamental',
        role: UserRole.AUTOR,
      },
    ];

    let count = 0;
    for (const userData of usuarios) {
      try {
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {},
          create: {
            name: userData.name,
            email: userData.email,
            cpf: userData.cpf,
            passwordHash,
            phone: userData.phone,
            birthDate: userData.birthDate,
            gender: userData.gender,
            nationality: 'Brasileiro',
            address: userData.address,
            neighborhood: userData.neighborhood,
            city: userData.city,
            state: userData.state,
            zipCode: userData.zipCode,
            country: 'Brasil',
            institution: userData.institution,
            position: userData.position,
            formation: userData.formation,
            role: userData.role,
            isActive: true,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });
        console.log(`   ✓ ${user.name} (${user.role})`);
        count++;
      } catch (error: any) {
        console.error(`   ✗ Erro ao criar ${userData.name}:`, error.message);
      }
    }

    console.log(`\n✅ ${count} USUÁRIOS CRIADOS COM SUCESSO!\n`);

  } catch (error) {
    console.error('❌ Erro ao popular usuários:', error);
    throw error;
  }
}

// =================== FUNÇÃO PRINCIPAL ===================
async function main() {
  console.log('🚀 Iniciando seed completo do FEBIC...\n');
  console.log('=====================================\n');

  try {
    // 1. Seed de Áreas
    await seedAreas();
    
    // 2. Seed de Usuários
    await seedUsers();

    console.log('=====================================');
    console.log('🎉 SEED COMPLETO FINALIZADO!');
    console.log('=====================================');
    console.log('\n📋 RESUMO:');
    console.log('   ✅ 7 Áreas principais + subáreas');
    console.log('   ✅ 1 Administrador');
    console.log('   ✅ 1 Coordenador de Avaliações');
    console.log('   ✅ 5 Avaliadores');
    console.log('   ✅ 3 Orientadores');
    console.log('   ✅ 6 Autores');
    console.log('\n🔑 Senha padrão: 123456');
    console.log('\n📧 Emails de acesso:');
    console.log('   • admin@febic.com.br (Admin)');
    console.log('   • coordenador@febic.com.br (Coordenador)');
    console.log('   • maria.santos@febic.com.br (Avaliadora)');
    console.log('   • fernando.alves@escola.com.br (Orientador)');
    console.log('   • pedro.silva@estudante.com (Autor)');
    console.log('\n');

  } catch (error) {
    console.error('❌ Erro crítico no seed:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('✅ Seed concluído com sucesso!');
  })
  .catch((e) => {
    console.error('💥 Erro fatal:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });