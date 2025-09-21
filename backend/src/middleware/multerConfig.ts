// backend/src/middleware/multerConfig.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // Estrutura: uploads/projects/{projectId}/documents/
    const { projectId } = req.params;
    const uploadPath = path.join(process.cwd(), 'uploads', 'projects', projectId || 'temp', 'documents');
    
    // Criar pastas se não existirem
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file, cb) => {
    // Formato: timestamp-random-nome-original.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitizar nome
    cb(null, `${uniqueSuffix}-${originalName}`);
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos permitidos expandidos
  const allowedMimes = [
    'application/pdf',                    // PDF
    'application/msword',                 // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'image/jpeg',                         // JPG/JPEG
    'image/png',                          // PNG
    'image/gif',                          // GIF
    'application/vnd.ms-excel',           // XLS
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'text/plain'                          // TXT
  ];
  
  const allowedExtensions = /\.(pdf|doc|docx|jpg|jpeg|png|gif|xls|xlsx|txt)$/i;
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}. Tipos aceitos: PDF, DOC, DOCX, JPG, PNG, GIF, XLS, XLSX, TXT`));
  }
};

// Configuração principal do multer
export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB (conforme solicitado)
    files: 5 // Máximo 5 arquivos por upload
  }
});

// Middleware para upload único
export const uploadSingle = uploadConfig.single('file');

// Middleware para múltiplos uploads
export const uploadMultiple = uploadConfig.array('files', 5);

// Export compatível com código antigo
export const upload = uploadConfig;

// Função utilitária para criar diretórios
export const ensureUploadDirectory = (projectId: string): string => {
  const uploadPath = path.join(process.cwd(), 'uploads', 'projects', projectId, 'documents');
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  return uploadPath;
};

// Função para deletar arquivo
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
};

// Função para obter tamanho formatado
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Função para obter extensão do arquivo
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

// Função para validar se arquivo é imagem
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

// Função para validar se arquivo é documento
export const isDocumentFile = (mimeType: string): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  return documentTypes.includes(mimeType);
};