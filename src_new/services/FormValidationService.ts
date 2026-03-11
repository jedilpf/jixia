// FormValidationService - 表单验证服务
// 提供表单字段验证、规则管理、错误提示等功能

export type ValidationRuleType =
  | "required"
  | "email"
  | "phone"
  | "url"
  | "number"
  | "integer"
  | "float"
  | "alpha"
  | "alphanumeric"
  | "min"
  | "max"
  | "minLength"
  | "maxLength"
  | "range"
  | "length"
  | "pattern"
  | "custom"
  | "match"
  | "unique";

export interface ValidationRule {
  type: ValidationRuleType;
  message?: string;
  value?: number | string | RegExp | unknown;
  validator?: (value: unknown, formData?: Record<string, unknown>) => boolean | Promise<boolean>;
  trigger?: "change" | "blur" | "submit" | ("change" | "blur" | "submit")[];
  skipIfEmpty?: boolean;
}

export interface FieldConfig {
  name: string;
  label?: string;
  rules: ValidationRule[];
  defaultValue?: unknown;
  transform?: (value: unknown) => unknown;
}

export interface ValidationError {
  field: string;
  label: string;
  rule: ValidationRuleType;
  message: string;
  value: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  fields: Record<string, ValidationError[]>;
}

export interface FormConfig {
  fields: FieldConfig[];
  validateOnSubmit?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  stopOnFirstError?: boolean;
}

// Built-in validators
const VALIDATORS: Record<ValidationRuleType, (value: unknown, ruleValue?: unknown) => boolean> = {
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
  },

  email: (value) => {
    if (!value || typeof value !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  phone: (value) => {
    if (!value || typeof value !== "string") return false;
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(value.replace(/\s/g, ""));
  },

  url: (value) => {
    if (!value || typeof value !== "string") return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  number: (value) => !isNaN(Number(value)),

  integer: (value) => Number.isInteger(Number(value)),

  float: (value) => {
    const num = Number(value);
    return !isNaN(num) && !Number.isInteger(num);
  },

  alpha: (value) => {
    if (typeof value !== "string") return false;
    return /^[a-zA-Z]+$/.test(value);
  },

  alphanumeric: (value) => {
    if (typeof value !== "string") return false;
    return /^[a-zA-Z0-9]+$/.test(value);
  },

  min: (value, min) => {
    const num = Number(value);
    return !isNaN(num) && num >= Number(min);
  },

  max: (value, max) => {
    const num = Number(value);
    return !isNaN(num) && num <= Number(max);
  },

  minLength: (value, minLen) => {
    if (typeof value === "string" || Array.isArray(value)) {
      return value.length >= Number(minLen);
    }
    return false;
  },

  maxLength: (value, maxLen) => {
    if (typeof value === "string" || Array.isArray(value)) {
      return value.length <= Number(maxLen);
    }
    return false;
  },

  range: (value, range) => {
    const num = Number(value);
    if (isNaN(num)) return false;
    const [min, max] = (range as string).split(",").map(Number);
    return num >= min && num <= max;
  },

  length: (value, len) => {
    if (typeof value === "string" || Array.isArray(value)) {
      return value.length === Number(len);
    }
    return false;
  },

  pattern: (value, pattern) => {
    if (typeof value !== "string") return false;
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern as string);
    return regex.test(value);
  },

  custom: () => true, // Custom validators handled separately

  match: (value, fieldName) => true, // Match handled separately with formData

  unique: (value) => {
    if (!Array.isArray(value)) return false;
    return new Set(value).size === value.length;
  },
};

// Default error messages
const DEFAULT_MESSAGES: Record<ValidationRuleType, string | ((label: string, value?: unknown) => string)> = {
  required: (label) => `${label}不能为空`,
  email: () => "请输入有效的邮箱地址",
  phone: () => "请输入有效的手机号码",
  url: () => "请输入有效的URL地址",
  number: () => "请输入数字",
  integer: () => "请输入整数",
  float: () => "请输入小数",
  alpha: () => "只能输入字母",
  alphanumeric: () => "只能输入字母和数字",
  min: (label, min) => `${label}不能小于${min}`,
  max: (label, max) => `${label}不能大于${max}`,
  minLength: (label, min) => `${label}长度不能少于${min}个字符`,
  maxLength: (label, max) => `${label}长度不能超过${max}个字符`,
  range: (label, range) => {
    const [min, max] = (range as string).split(",");
    return `${label}必须在${min}到${max}之间`;
  },
  length: (label, len) => `${label}长度必须为${len}个字符`,
  pattern: () => "格式不正确",
  custom: () => "验证失败",
  match: (label, field) => `${label}与${field}不一致`,
  unique: () => "不能包含重复值",
};

export class FormValidationService {
  private customValidators: Map<string, (value: unknown, formData?: Record<string, unknown>) => boolean | Promise<boolean>> = new Map();

  // Register custom validator
  registerValidator(
    name: string,
    validator: (value: unknown, formData?: Record<string, unknown>) => boolean | Promise<boolean>
  ): void {
    this.customValidators.set(name, validator);
  }

  // Unregister custom validator
  unregisterValidator(name: string): void {
    this.customValidators.delete(name);
  }

  // Validate a single field
  async validateField(
    field: FieldConfig,
    value: unknown,
    formData?: Record<string, unknown>,
    trigger?: "change" | "blur" | "submit"
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    for (const rule of field.rules) {
      // Check trigger
      if (trigger && rule.trigger) {
        const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger];
        if (!triggers.includes(trigger)) continue;
      }

      // Skip if empty and not required
      if (rule.skipIfEmpty && !VALIDATORS.required(value)) {
        continue;
      }

      let isValid = true;

      // Handle custom validator
      if (rule.type === "custom" && rule.validator) {
        const result = rule.validator(value, formData);
        isValid = result instanceof Promise ? await result : result;
      }
      // Handle match validator
      else if (rule.type === "match" && rule.value && formData) {
        const matchValue = formData[rule.value as string];
        isValid = value === matchValue;
      }
      // Handle registered custom validators
      else if (this.customValidators.has(rule.type)) {
        const validator = this.customValidators.get(rule.type)!;
        const result = validator(value, formData);
        isValid = result instanceof Promise ? await result : result;
      }
      // Use built-in validator
      else {
        isValid = VALIDATORS[rule.type](value, rule.value);
      }

      if (!isValid) {
        const message = this.getErrorMessage(field.label || field.name, rule);
        errors.push({
          field: field.name,
          label: field.label || field.name,
          rule: rule.type,
          message,
          value,
        });
      }
    }

    return errors;
  }

  // Validate entire form
  async validateForm(
    config: FormConfig,
    formData: Record<string, unknown>,
    trigger?: "change" | "blur" | "submit"
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      fields: {},
    };

    for (const field of config.fields) {
      const value = formData[field.name];
      const errors = await this.validateField(field, value, formData, trigger);

      if (errors.length > 0) {
        result.valid = false;
        result.errors.push(...errors);
        result.fields[field.name] = errors;

        if (config.stopOnFirstError) {
          break;
        }
      }
    }

    return result;
  }

  // Quick validation helpers
  validateRequired(value: unknown): boolean {
    return VALIDATORS.required(value);
  }

  validateEmail(value: string): boolean {
    return VALIDATORS.email(value);
  }

  validatePhone(value: string): boolean {
    return VALIDATORS.phone(value);
  }

  validateUrl(value: string): boolean {
    return VALIDATORS.url(value);
  }

  validateMin(value: number, min: number): boolean {
    return VALIDATORS.min(value, min);
  }

  validateMax(value: number, max: number): boolean {
    return VALIDATORS.max(value, max);
  }

  validateMinLength(value: string, minLen: number): boolean {
    return VALIDATORS.minLength(value, minLen);
  }

  validateMaxLength(value: string, maxLen: number): boolean {
    return VALIDATORS.maxLength(value, maxLen);
  }

  validatePattern(value: string, pattern: RegExp): boolean {
    return VALIDATORS.pattern(value, pattern);
  }

  // Create validation rules
  required(message?: string): ValidationRule {
    return { type: "required", message };
  }

  email(message?: string): ValidationRule {
    return { type: "email", message };
  }

  phone(message?: string): ValidationRule {
    return { type: "phone", message };
  }

  url(message?: string): ValidationRule {
    return { type: "url", message };
  }

  number(message?: string): ValidationRule {
    return { type: "number", message };
  }

  min(value: number, message?: string): ValidationRule {
    return { type: "min", value, message };
  }

  max(value: number, message?: string): ValidationRule {
    return { type: "max", value, message };
  }

  minLength(value: number, message?: string): ValidationRule {
    return { type: "minLength", value, message };
  }

  maxLength(value: number, message?: string): ValidationRule {
    return { type: "maxLength", value, message };
  }

  range(min: number, max: number, message?: string): ValidationRule {
    return { type: "range", value: `${min},${max}`, message };
  }

  length(value: number, message?: string): ValidationRule {
    return { type: "length", value, message };
  }

  pattern(regex: RegExp, message?: string): ValidationRule {
    return { type: "pattern", value: regex, message };
  }

  match(field: string, message?: string): ValidationRule {
    return { type: "match", value: field, message };
  }

  unique(message?: string): ValidationRule {
    return { type: "unique", message };
  }

  custom(
    validator: (value: unknown, formData?: Record<string, unknown>) => boolean | Promise<boolean>,
    message?: string
  ): ValidationRule {
    return { type: "custom", validator, message };
  }

  // Get error message
  private getErrorMessage(label: string, rule: ValidationRule): string {
    if (rule.message) return rule.message;

    const defaultMessage = DEFAULT_MESSAGES[rule.type];
    if (typeof defaultMessage === "function") {
      return defaultMessage(label, rule.value);
    }
    return defaultMessage;
  }

  // Create form validator
  createValidator(config: FormConfig) {
    return {
      validateField: (fieldName: string, value: unknown, formData?: Record<string, unknown>, trigger?: "change" | "blur" | "submit") => {
        const field = config.fields.find((f) => f.name === fieldName);
        if (!field) return Promise.resolve([]);
        return this.validateField(field, value, formData, trigger);
      },
      validateForm: (formData: Record<string, unknown>, trigger?: "change" | "blur" | "submit") => {
        return this.validateForm(config, formData, trigger);
      },
      getFieldConfig: (fieldName: string) => config.fields.find((f) => f.name === fieldName),
    };
  }
}

export const formValidationService = new FormValidationService();

// Export rule creators for convenience
export const rules = {
  required: (message?: string) => formValidationService.required(message),
  email: (message?: string) => formValidationService.email(message),
  phone: (message?: string) => formValidationService.phone(message),
  url: (message?: string) => formValidationService.url(message),
  number: (message?: string) => formValidationService.number(message),
  min: (value: number, message?: string) => formValidationService.min(value, message),
  max: (value: number, message?: string) => formValidationService.max(value, message),
  minLength: (value: number, message?: string) => formValidationService.minLength(value, message),
  maxLength: (value: number, message?: string) => formValidationService.maxLength(value, message),
  range: (min: number, max: number, message?: string) => formValidationService.range(min, max, message),
  length: (value: number, message?: string) => formValidationService.length(value, message),
  pattern: (regex: RegExp, message?: string) => formValidationService.pattern(regex, message),
  match: (field: string, message?: string) => formValidationService.match(field, message),
  unique: (message?: string) => formValidationService.unique(message),
  custom: (validator: (value: unknown, formData?: Record<string, unknown>) => boolean | Promise<boolean>, message?: string) =>
    formValidationService.custom(validator, message),
};
