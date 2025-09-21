
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 VALIDAÇÃO: Iniciando...');
    console.log('🔍 Dados recebidos - Chaves:', Object.keys(req.body));
    console.log('🔍 Dados recebidos - Primeira parte:', JSON.stringify(req.body, null, 2).slice(0, 500));
    
    const { error } = schema.validate(req.body);
    
    if (error) {
      console.log('❌ VALIDAÇÃO FALHOU:');
      error.details.forEach((detail, index) => {
        console.log(`  ${index + 1}. ${detail.message} (campo: ${detail.path.join('.')})`);
      });
      
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    console.log('✅ VALIDAÇÃO: Passou!');
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    req.query = value;
    next();
  };
};