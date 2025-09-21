import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

interface ValidatedFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  validationRules?: ValidationRule[];
  className?: string;
  options?: Array<{ value: string; label: string }>;
  children?: React.ReactNode;
}

const ValidatedField: React.FC<ValidatedFieldProps> = ({
  label,
  required = false,
  value,
  onChange,
  type = 'text',
  placeholder,
  rows = 3,
  maxLength,
  validationRules = [],
  className = '',
  options = [],
  children
}) => {
  // Verificar se há erros
  const errors = validationRules
    .filter(rule => !rule.test(value))
    .map(rule => rule.message);

  const hasErrors = errors.length > 0 && value.length > 0;
  const isValid = errors.length === 0 && value.length > 0;

  const baseInputClasses = `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
    ${hasErrors ? 'border-red-300 bg-red-50' : ''}
    ${isValid ? 'border-green-300 bg-green-50' : ''}
    ${!value ? 'border-gray-300' : ''}
    ${className}
  `;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          maxLength={maxLength}
          className={baseInputClasses}
          placeholder={placeholder}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={onChange}
          className={baseInputClasses}
        >
          <option value="">{placeholder || 'Selecione'}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={baseInputClasses}
        placeholder={placeholder}
      />
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {renderInput()}
      
      {/* Contador de caracteres para campos longos */}
      {maxLength && value.length > 0 && (
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{value.length}/{maxLength} caracteres</span>
          {value.length > maxLength * 0.9 && (
            <span className="text-amber-600">Próximo do limite</span>
          )}
        </div>
      )}
      
      {/* Mostrar erros */}
      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}
      
      {/* Mostrar sucesso */}
      {isValid && required && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Campo válido
        </div>
      )}
    </div>
  );
};

// Regras de validação reutilizáveis
export const validationRules = {
  title: [
    { test: (value: string) => value.length >= 10, message: 'Título deve ter pelo menos 10 caracteres' },
    { test: (value: string) => value.length <= 500, message: 'Título deve ter no máximo 500 caracteres' }
  ],
  summary: [
    { test: (value: string) => value.length >= 50, message: 'Resumo deve ter pelo menos 50 caracteres' },
    { test: (value: string) => value.length <= 3000, message: 'Resumo deve ter no máximo 3000 caracteres' }
  ],
  objective: [
    { test: (value: string) => value.length >= 20, message: 'Objetivo deve ter pelo menos 20 caracteres' },
    { test: (value: string) => value.length <= 2000, message: 'Objetivo deve ter no máximo 2000 caracteres' }
  ],
  methodology: [
    { test: (value: string) => value.length >= 50, message: 'Metodologia deve ter pelo menos 50 caracteres' },
    { test: (value: string) => value.length <= 3000, message: 'Metodologia deve ter no máximo 3000 caracteres' }
  ],
  institution: [
    { test: (value: string) => value.length >= 3, message: 'Instituição deve ter pelo menos 3 caracteres' },
    { test: (value: string) => value.length <= 200, message: 'Instituição deve ter no máximo 200 caracteres' }
  ],
  memberName: [
    { test: (value: string) => value.length >= 2, message: 'Nome deve ter pelo menos 2 caracteres' },
    { test: (value: string) => value.length <= 200, message: 'Nome deve ter no máximo 200 caracteres' }
  ],
  email: [
    { test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value === '', message: 'Email deve ter formato válido' }
  ],
  orientadorFormation: [
    { test: (value: string) => value.length >= 5, message: 'Formação deve ter pelo menos 5 caracteres' },
    { test: (value: string) => value.length <= 200, message: 'Formação deve ter no máximo 200 caracteres' }
  ],
  orientadorArea: [
    { test: (value: string) => value.length >= 3, message: 'Área deve ter pelo menos 3 caracteres' },
    { test: (value: string) => value.length <= 200, message: 'Área deve ter no máximo 200 caracteres' }
  ],
  city: [
    { test: (value: string) => value.length >= 2, message: 'Cidade deve ter pelo menos 2 caracteres' },
    { test: (value: string) => value.length <= 100, message: 'Cidade deve ter no máximo 100 caracteres' }
  ],
  state: [
    { test: (value: string) => value.length === 2, message: 'Estado deve ter exatamente 2 caracteres (UF)' },
    { test: (value: string) => /^[A-Z]{2}$/.test(value.toUpperCase()) || value === '', message: 'Estado deve conter apenas letras maiúsculas' }
  ]
};

export default ValidatedField;