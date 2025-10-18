
interface AccordionSectionProps {
    label: string;
    children: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    isSidebarExtended: boolean;
}

export function AccordionSection({ label, children, isExpanded, onToggle, isSidebarExtended }: AccordionSectionProps) {
    return (
        <div className='mt-2'>
            <hr className='border-gray-300 dark:border-neutral-700' />
            {
                isSidebarExtended ?
                    <button
                        onClick={onToggle}
                        className={`cursor-pointer w-full flex items-center justify-between mt-1 px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors ${isSidebarExtended ? '' : 'pointer-events-none'
                            }`}
                        disabled={!isSidebarExtended}
                    >
                        <p className={`text-left text-xs text-gray-500 dark:text-neutral-400 transition-opacity duration-300 uppercase ${isSidebarExtended ? 'opacity-100 delay-150' : 'opacity-0'
                            }`}>
                            {isSidebarExtended ? label : null}
                        </p>

                        <svg
                            className={`w-3 h-3 text-gray-500 dark:text-neutral-400 transition-all duration-200 ${isSidebarExtended ? 'opacity-100 delay-150' : 'opacity-0'
                                } ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    : null
            }

            <div
                className={`overflow-hidden transition-all duration-300 ${isExpanded || !isSidebarExtended ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className='flex flex-col gap-2 mt-2'>
                    {children}
                </div>
            </div>
        </div>
    );
}