import Joi from 'joi';
import { Category, ProjectStatus } from '@prisma/client';

const validCategories = Object.values(Category);
const validStatuses = Object.values(ProjectStatus);

export const createProjectSchema = Joi.object({
  // Dados básicos do projeto
  title: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.min': 'Título deve ter pelo menos 10 caracteres',
      'string.max': 'Título deve ter no máximo 500 caracteres',
      'any.required': 'Título é obrigatório'
    }),
  
  summary: Joi.string()  // Mudança: summary em vez de abstract
    .min(50)
    .max(3000)
    .required()
    .messages({
      'string.min': 'Resumo deve ter pelo menos 50 caracteres',
      'string.max': 'Resumo deve ter no máximo 3000 caracteres',
      'any.required': 'Resumo é obrigatório'
    }),
    
  objective: Joi.string()
    .min(20)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Objetivo deve ter pelo menos 20 caracteres',
      'any.required': 'Objetivo é obrigatório'
    }),
    
  methodology: Joi.string()
    .min(50)
    .max(3000)
    .required()
    .messages({
      'string.min': 'Metodologia deve ter pelo menos 50 caracteres',
      'any.required': 'Metodologia é obrigatória'
    }),
    
  results: Joi.string().allow('').max(3000),
  conclusion: Joi.string().allow('').max(2000),
  bibliography: Joi.string().allow('').max(5000),
    
  category: Joi.string()
    .valid(...validCategories)
    .required()
    .messages({
      'any.only': 'Categoria inválida',
      'any.required': 'Categoria é obrigatória'
    }),
    
  areaConhecimentoId: Joi.string()
    .required()
    .messages({
      'any.required': 'Área de conhecimento é obrigatória'
    }),
    
  keywords: Joi.array().items(Joi.string()).default([]),
  researchLine: Joi.string().allow('').max(200),
  
  // Dados da instituição
  institution: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'any.required': 'Instituição é obrigatória'
    }),
    
  institutionCity: Joi.string().max(100).allow(''),
  institutionState: Joi.string().max(2).allow(''),
  institutionCountry: Joi.string().max(100).default('Brasil'),
  
  // Características da escola/projeto
  isPublicSchool: Joi.boolean().default(false),
  isRuralSchool: Joi.boolean().default(false),
  isIndigenous: Joi.boolean().default(false),
  hasDisability: Joi.boolean().default(false),
  socialVulnerability: Joi.boolean().default(false),
  
  // Integrantes
  members: Joi.array().items(
    Joi.object({
      userId: Joi.string().optional(),
      name: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
          'any.required': 'Nome do integrante é obrigatório'
        }),
      email: Joi.string().email().allow('').optional(),
      cpf: Joi.string().allow('').optional(),
      rg: Joi.string().allow('').optional(),
      birthDate: Joi.date()
        .required()
        .messages({
          'any.required': 'Data de nascimento é obrigatória'
        }),
      gender: Joi.string()
        .valid('Masculino', 'Feminino', 'Outro', 'Prefiro não informar')
        .required(),
      phone: Joi.string().allow('').optional(),
      address: Joi.string().allow('').optional(),
      city: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'any.required': 'Cidade do integrante é obrigatória'
        }),
      state: Joi.string()
        .min(2)
        .max(2)
        .required()
        .messages({
          'any.required': 'Estado do integrante é obrigatório'
        }),
      zipCode: Joi.string().allow('').optional(),
      schoolLevel: Joi.string()
        .valid(
          'Educação Infantil',
          'Ensino Fundamental 1º-3º',
          'Ensino Fundamental 4º-6º', 
          'Ensino Fundamental 7º-9º',
          'Ensino Médio',
          'Ensino Técnico',
          'EJA - Educação de Jovens e Adultos',
          'Ensino Superior',
          'Pós-graduação'
        )
        .required(),
      schoolYear: Joi.string().allow('').optional(),
      institution: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
          'any.required': 'Instituição do integrante é obrigatória'
        }),
      isIndigenous: Joi.boolean().default(false),
      hasDisability: Joi.boolean().default(false),
      isRural: Joi.boolean().default(false)
    })
  ).min(1).required().messages({
    'array.min': 'Pelo menos um integrante é obrigatório'
  }),
  
  // Orientadores
  orientadores: Joi.array().items(
    Joi.object({
      userId: Joi.string().optional(),
      name: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
          'any.required': 'Nome do orientador é obrigatório'
        }),
      email: Joi.string()
        .email()
        .required()
        .messages({
          'any.required': 'Email do orientador é obrigatório'
        }),
      cpf: Joi.string().allow('').optional(),
      phone: Joi.string().allow('').optional(),
      formation: Joi.string()
        .min(5)
        .max(200)
        .required()
        .messages({
          'any.required': 'Formação do orientador é obrigatória'
        }),
      area: Joi.string()
        .min(3)
        .max(200)
        .required()
        .messages({
          'any.required': 'Área de atuação do orientador é obrigatória'
        }),
      institution: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
          'any.required': 'Instituição do orientador é obrigatória'
        }),
      position: Joi.string().allow('').optional(),
      city: Joi.string().max(100).allow(''),
      state: Joi.string().max(2).allow(''),
      yearsExperience: Joi.number().integer().min(0).default(0),
      lattesUrl: Joi.string().uri().allow('').optional()
    })
  ).min(1).max(2).required().messages({
    'array.min': 'Pelo menos um orientador é obrigatório',
    'array.max': 'Máximo de 2 orientadores permitido'
  }),
  
  // Campos de pagamento
  paymentRequired: Joi.boolean().default(true),
  isPaymentExempt: Joi.boolean().default(false),
  exemptionReason: Joi.string().allow('').optional()
});

// ✅ SCHEMA DE UPDATE CORRIGIDO
export const updateProjectSchema = Joi.object({
  // Campos básicos do projeto (todos opcionais para update)
  title: Joi.string()
    .min(10)
    .max(500)
    .messages({
      'string.min': 'Título deve ter pelo menos 10 caracteres',
      'string.max': 'Título deve ter no máximo 500 caracteres'
    }),
    
  // ✅ CORRIGIDO: summary em vez de abstract
  summary: Joi.string()
    .min(50)
    .max(3000)
    .messages({
      'string.min': 'Resumo deve ter pelo menos 50 caracteres',
      'string.max': 'Resumo deve ter no máximo 3000 caracteres'
    }),
    
  // ✅ ADICIONADOS: campos que o frontend envia
  objective: Joi.string()
    .min(20)
    .max(2000)
    .messages({
      'string.min': 'Objetivo deve ter pelo menos 20 caracteres',
      'string.max': 'Objetivo deve ter no máximo 2000 caracteres'
    }),
    
  methodology: Joi.string()
    .min(50)
    .max(3000)
    .messages({
      'string.min': 'Metodologia deve ter pelo menos 50 caracteres',
      'string.max': 'Metodologia deve ter no máximo 3000 caracteres'
    }),
    
  results: Joi.string()
    .allow('')
    .max(3000)
    .messages({
      'string.max': 'Resultados deve ter no máximo 3000 caracteres'
    }),
    
  conclusion: Joi.string()
    .allow('')
    .max(2000)
    .messages({
      'string.max': 'Conclusão deve ter no máximo 2000 caracteres'
    }),
    
  bibliography: Joi.string()
    .allow('')
    .max(5000)
    .messages({
      'string.max': 'Bibliografia deve ter no máximo 5000 caracteres'
    }),
    
  // ✅ ADICIONADO: keywords que o frontend envia
  keywords: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .messages({
      'array.max': 'Máximo de 10 palavras-chave permitidas'
    }),
    
  researchLine: Joi.string()
    .allow('')
    .max(200)
    .messages({
      'string.max': 'Linha de pesquisa deve ter no máximo 200 caracteres'
    }),
    
  category: Joi.string()
    .valid(...validCategories)
    .messages({
      'any.only': 'Categoria inválida'
    }),
    
  areaConhecimentoId: Joi.string()
    .messages({
      'string.base': 'Área de conhecimento deve ser uma string válida'
    }),
    
  // Dados institucionais (opcionais no update)
  institution: Joi.string()
    .min(3)
    .max(200)
    .messages({
      'string.min': 'Instituição deve ter pelo menos 3 caracteres',
      'string.max': 'Instituição deve ter no máximo 200 caracteres'
    }),
    
  institutionCity: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Cidade deve ter no máximo 100 caracteres'
    }),
    
  institutionState: Joi.string()
    .max(2)
    .allow('')
    .messages({
      'string.max': 'Estado deve ter no máximo 2 caracteres'
    }),
    
  institutionCountry: Joi.string()
    .max(100)
    .default('Brasil')
    .messages({
      'string.max': 'País deve ter no máximo 100 caracteres'
    }),
    
  // Características da escola/projeto
  isPublicSchool: Joi.boolean(),
  isRuralSchool: Joi.boolean(),
  isIndigenous: Joi.boolean(),
  hasDisability: Joi.boolean(),
  socialVulnerability: Joi.boolean(),
  
  // Campos de pagamento
  paymentRequired: Joi.boolean(),
  isPaymentExempt: Joi.boolean(),
  exemptionReason: Joi.string().allow('').max(1000)
  
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...validStatuses)
    .required()
    .messages({
      'any.only': 'Status inválido',
      'any.required': 'Status é obrigatório'
    })
});

export const projectFiltersSchema = Joi.object({
  status: Joi.string().valid(...validStatuses),
  category: Joi.string().valid(...validCategories),
  authorId: Joi.number().integer().positive(),
  search: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});