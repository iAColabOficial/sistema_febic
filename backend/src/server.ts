import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

// Configurar variáveis de ambiente PRIMEIRO
dotenv.config();

// Importar rotas
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import documentRoutes from './routes/documents';
// import evaluationRoutes from './routes/evaluations'; // TODO: Criar quando implementar avaliações

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// CONFIGURAÇÃO INICIAL
// ========================================

// Criar pasta uploads na inicialização
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('📁 Pasta uploads criada:', uploadsPath);
}

// ========================================
// MIDDLEWARES GLOBAIS (ORDEM IMPORTANTE!)
// ========================================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Para permitir acesso aos uploads
}));

// CORS - DEVE vir antes das rotas
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing - DEVE vir antes das rotas
app.use(express.json({ limit: '25mb' })); // Aumentar limite para uploads base64
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Servir arquivos estáticos (uploads)
// NOTA: Em produção, use CDN ou cloud storage
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  // Configurações de segurança para arquivos estáticos
  setHeaders: (res, filePath) => {
    // Prevenir execução de scripts
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
  }
}));

// ========================================
// ROTAS PRINCIPAIS
// ========================================

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'FEBIC API está funcionando!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      documents: '/api/projects/:id/documents'
      // evaluations: '/api/evaluations' // TODO: Adicionar quando implementar
    }
  });
});

// Health check melhorado
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uploads: fs.existsSync(uploadsPath) ? 'OK' : 'ERROR',
    memory: {
      used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
    }
  };
  
  res.json(healthStatus);
});

// ========================================
// ROTAS DA API
// ========================================

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas de projetos
app.use('/api/projects', projectRoutes);

// Rotas de documentos (já inclui /api)
app.use('/api', documentRoutes);

// Rotas de avaliações (já inclui /api)
// app.use('/api', evaluationRoutes); // TODO: Adicionar quando implementar avaliações

// ========================================
// TRATAMENTO DE ERROS
// ========================================

// Middleware para lidar com arquivos muito grandes
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload muito grande. Tamanho máximo permitido: 25MB'
    });
  }
  next(error);
});

// Middleware para rotas não encontradas
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.path}`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/projects',
      'POST /api/projects/:id/documents'
      // 'GET /api/evaluations' // TODO: Adicionar quando implementar
    ]
  });
});

// Middleware geral de tratamento de erros
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro não tratado:', error);
  
  // Log mais detalhado em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', error.stack);
  }
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    })
  });
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log('\n🚀 =================================');
  console.log('   FEBIC Backend iniciado!');
  console.log('=================================');
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`📊 Projects: http://localhost:${PORT}/api/projects`);
  console.log(`📁 Documents: http://localhost:${PORT}/api/projects/:id/documents`);
  // console.log(`⭐ Evaluations: http://localhost:${PORT}/api/evaluations`); // TODO: Adicionar quando implementar
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log('=================================');
  console.log(`📁 Uploads: ${uploadsPath}`);
  console.log(`🌍 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================\n');
});

export default app;