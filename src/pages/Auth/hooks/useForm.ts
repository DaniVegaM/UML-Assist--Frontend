import { useState } from 'react';
import { validateField, type ValidationRules } from '../../../helpers/validation';

interface FormField {
    value: string;
    error: string;
}

interface FormData {
    [key: string]: FormField;
}

interface UseFormOptions {
    initialValues: Record<string, string>;
    validationRules: ValidationRules;
    onSubmit: (values: Record<string, string>) => Promise<void> | void;
    customValidations?: Record<string, (value: string, formData: FormData) => string>;
}

export const useForm = ({ initialValues, validationRules, onSubmit, customValidations = {} }: UseFormOptions) => {
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    
    const initializeFormData = (values: Record<string, string>): FormData => {
        const formData: FormData = {};
        
        Object.keys(values).forEach(key => {
            formData[key] = {
                value: values[key],
                error: ''
            };
        });
        return formData;
    };

    const [formData, setFormData] = useState<FormData>(() => initializeFormData(initialValues));

    const handleFieldChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                value: value
            }
        }));
        setGeneralError('');
    };

    const handleInputBlur = (name: string, value: string, type: string) => {
        if (validationRules[type]) {
            const fieldError = validateField(value, validationRules[type]);
            setFormData(prev => ({
                ...prev,
                [name]: {
                    ...prev[name],
                    error: fieldError
                }
            }));
        }
    };

    const validateAllFields = (): boolean => {
        const newFormData = { ...formData };
        let hasErrors = false;

        Object.keys(formData).forEach(fieldName => {
            const fieldValue = formData[fieldName].value;
            
            // Validación estándar
            if (validationRules[fieldName]) {
                const fieldError = validateField(fieldValue, validationRules[fieldName]);
                newFormData[fieldName].error = fieldError;
                if (fieldError) hasErrors = true;
            }

            // Validaciones customizadas
            if (customValidations[fieldName]) {
                const customError = customValidations[fieldName](fieldValue, formData);
                newFormData[fieldName].error = customError;
                if (customError) hasErrors = true;
            }
        });

        setFormData(newFormData);
        return !hasErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateAllFields()) {
            return;
        }

        try {
            setLoading(true);
            setGeneralError('');
            
            // Convertir formData a valores simples para el onSubmit
            const values: Record<string, string> = {};
            Object.keys(formData).forEach(key => {
                values[key] = formData[key].value;
            });
            
            await onSubmit(values);
        } catch (error) {
            setGeneralError('Ocurrió un error. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const setFieldError = (fieldName: string, error: string) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                error: error
            }
        }));
    };

    return {
        formData,
        loading,
        generalError,
        handleFieldChange,
        handleInputBlur,
        handleSubmit,
        setGeneralError,
        setFieldError
    };
};