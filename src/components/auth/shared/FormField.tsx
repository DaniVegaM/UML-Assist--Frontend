interface FormFieldsProps {
    name: string;
    label?: string;
    type?: 'email' | 'password' | 'text';
    placeholder?: string;
    value: string;
    error?: string;
    onChange: (name: string, value: string) => void;
    onBlur: (name: string, value: string, type: string) => void;
}

export default function FormField({ label, type = 'text', name, placeholder, value, onChange, onBlur, error }: FormFieldsProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        onChange(name, value);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        onBlur(name, value, type);
    };

    return (
        <div>
            <label htmlFor={ name } className="block text-sm font-medium text-gray-700 mb-1">
                { label }
            </label>
            <input
                name={ name }
                type={ type }
                value={ value }
                onChange={ handleInputChange }
                onBlur={ handleInputBlur }
                placeholder={ placeholder }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            <div className="h-5 mt-1">
                {error && (
                    <p className="text-red-500 text-sm">{ error }</p>
                )}
            </div>
        </div>
    )
}