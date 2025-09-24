import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...\n');

  // Limpar dados existentes
  await prisma.user.deleteMany();
  console.log('Usuários anteriores removidos');

  // Hash da senha padrão
  const hashedPassword = await bcrypt.hash('admin123', 12);
  console.log('Senha hashada gerada');

  // Criar usuários completos
  const users = [
    {
      name: 'Administrador Sistema',
      email: 'admin@febic.com.br',
      cpf: '12345678901',
      passwordHash: hashedPassword,
      phone: '(47) 99999-0001',
      birthDate: new Date('1980-01-15'),
      gender: 'Masculino',
      nationality: 'Brasileiro',
      address: 'Rua das Palmeiras, 123',
      neighborhood: 'Centro',
      city: 'Blumenau',
      state: 'SC',
      zipCode: '89010-000',
      country: 'Brasil',
      institution: 'FEBIC - Organização',
      position: 'Administrador Geral',
      formation: 'Bacharel em Administração',
      role: UserRole.ADMINISTRADOR,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      loginCount: 0
    },
    {
      name: 'João Silva Autor',
      email: 'autor@febic.com.br',
      cpf: '98765432101',
      passwordHash: hashedPassword,
      phone: '(47) 99999-0002',
      birthDate: new Date('1995-05-20'),
      gender: 'Masculino',
      nationality: 'Brasileiro',
      address: 'Av. Brasil, 456',
      neighborhood: 'Vila Nova',
      city: 'Blumenau',
      state: 'SC',
      zipCode: '89012-000',
      country: 'Brasil',
      institution: 'Escola Estadual Santos Dumont',
      position: 'Estudante Ensino Médio',
      formation: 'Ensino Médio em andamento',
      role: UserRole.AUTOR,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      loginCount: 0
    },
    {
      name: 'Maria Oliveira Avaliadora',
      email: 'avaliador@febic.com.br',
      cpf: '11122233301',
      passwordHash: hashedPassword,
      phone: '(47) 99999-0003',
      birthDate: new Date('1975-08-10'),
      gender: 'Feminino',
      nationality: 'Brasileira',
      address: 'Rua dos Professores, 789',
      neighborhood: 'Jardim Blumenau',
      city: 'Blumenau',
      state: 'SC',
      zipCode: '89020-000',
      country: 'Brasil',
      institution: 'Universidade Regional de Blumenau',
      position: 'Professora Doutora',
      formation: 'Doutorado em Educação',
      role: UserRole.AVALIADOR,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      loginCount: 0
    },
    {
      name: 'Carlos Santos Orientador',
      email: 'orientador@febic.com.br',
      cpf: '44455566601',
      passwordHash: hashedPassword,
      phone: '(47) 99999-0004',
      birthDate: new Date('1970-12-03'),
      gender: 'Masculino',
      nationality: 'Brasileiro',
      address: 'Rua da Ciência, 321',
      neighborhood: 'Ponta Aguda',
      city: 'Blumenau',
      state: 'SC',
      zipCode: '89050-000',
      country: 'Brasil',
      institution: 'Instituto Federal de Santa Catarina',
      position: 'Professor',
      formation: 'Mestrado em Ciências',
      role: UserRole.ORIENTADOR,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      loginCount: 0
    },
    {
      name: 'Ana Costa Financeiro',
      email: 'financeiro@febic.com.br',
      cpf: '77788899901',
      passwordHash: hashedPassword,
      phone: '(47) 99999-0005',
      birthDate: new Date('1985-03-25'),
      gender: 'Feminino',
      nationality: 'Brasileira',
      address: 'Av. Governador Jorge Lacerda, 567',
      neighborhood: 'Velha',
      city: 'Blumenau',
      state: 'SC',
      zipCode: '89040-000',
      country: 'Brasil',
      institution: 'FEBIC - Financeiro',
      position: 'Analista Financeiro',
      formation: 'Bacharel em Contabilidade',
      role: UserRole.FINANCEIRO,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      loginCount: 0
    },
    {
      name: 'Pedro Almeida Feira Afiliada',
      email: 'feira@febic.com.br',
      cpf: '55566677701',
      passwordHash: hashedPassword,
      phone: '(47) 99999-0006',
      birthDate: new Date('1982-07-18'),
      gender: 'Masculino',
      nationality: 'Brasileiro',
      address: 'Rua das Feiras, 888',
      neighborhood: 'Garcia',
      city: 'Blumenau',
      state: 'SC',
      zipCode: '89030-000',
      country: 'Brasil',
      institution: 'Feira de Ciências Blumenau',
      position: 'Coordenador',
      formation: 'Licenciatura em Química',
      role: UserRole.FEIRA_AFILIADA,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      loginCount: 0
    }
  ];

  // Criar usuários no banco
  console.log('\nCriando usuários...\n');
  for (const userData of users) {
    try {
      await prisma.user.create({
        data: userData
      });
      console.log(`Usuário criado: ${userData.name} (${userData.email})`);
    } catch (error) {
      console.error(`Erro ao criar usuário ${userData.email}:`, error);
    }
  }

  console.log('\nSeed executado com sucesso!');
  console.log('\n=== CREDENCIAIS DE ACESSO ===');
  console.log('Todos os usuários têm a senha: admin123\n');
  
  users.forEach(user => {
    console.log(`${user.role.toString().padEnd(15)} | ${user.email}`);
  });
  
  console.log('\n=== RESUMO ===');
  console.log(`Total: ${users.length} usuários criados`);
  console.log('Roles: ADMINISTRADOR, AUTOR, AVALIADOR, ORIENTADOR, FINANCEIRO, FEIRA_AFILIADA');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });