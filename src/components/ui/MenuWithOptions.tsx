import type { JSX } from "react";

interface MenuWithOptionsProps {
    options: {
        title: string,
        svg: JSX.Element,
        onClick: () => void
    }[];
}

export default function MenuWithOptions({ options }: MenuWithOptionsProps) {
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[150px] overflow-hidden">
            {options.map((option, index) => (
                <div 
                    key={index}
                    onClick={option.onClick}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-sky-100 dark:hover:bg-neutral-700 cursor-pointer text-sm dark:text-white"
                >
                    <div className="w-6 h-6 flex items-center justify-center">
                        {option.svg}
                    </div>
                    <span>{option.title}</span>
                </div>
            ))}
        </div>
    )
}

