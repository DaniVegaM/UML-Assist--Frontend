export interface ValidationRule {
    required?: boolean;
    email?: boolean;
    minLength?: number;
}

export interface ValidationRules {
    [key: string]: ValidationRule;
}

export interface ValidationErrors {
    [key: string]: string;
}

export const validateField = (value: string, rules: ValidationRule): string => {
    if (rules.required && !value.trim()) {
        return 'Este campo es requerido';
    }

    if (rules.email && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Ingrese un correo electrónico válido';
        }
    }

    if (rules.minLength && value.trim().length < rules.minLength) {
        return `Debe tener al menos ${rules.minLength} caracteres`;
    }

    return '';
};

export const validateForm = (data: Record<string, string>, rules: ValidationRules): ValidationErrors => {
    const errors: ValidationErrors = {};

    Object.keys(rules).forEach(field => {
        const fieldError = validateField(data[field] || '', rules[field]);
        if (fieldError) {
            errors[field] = fieldError;
        }
    });

    return errors;
};

// Reglas predefinidas para diferentes formularios
export const LOGIN_VALIDATION_RULES: ValidationRules = {
    email: { required: true, email: true },
    password: { required: true }
};

export const REGISTER_VALIDATION_RULES: ValidationRules = {
    email: { required: true, email: true },
    password: { required: true, minLength: 8 }
};