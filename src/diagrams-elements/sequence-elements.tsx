
export const SEQUENCE_NODES = [
    {
        separator: 'Fragmentos',
    },
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="145" height="86" viewBox="0 0 145 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M145 86H0V0H145V86ZM86.6025 19.5L64.3008 31.5H5V81H140V5H86.6025V19.5ZM5 26.5H63.041L81.6025 16.5127V5H5V26.5Z" fill="black" />
                <path d="M5 45 L140 45" stroke="black" strokeWidth="1" strokeDasharray="4 4" />
                <text x="20" y="18" fontSize="12" fill="black" fontFamily="monospace" fontWeight="bold">alt</text>
            </svg>
        ),
        nodeType: 'altFragment',
        label: 'Alt (Alternativa)',
    },
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="145" height="86" viewBox="0 0 145 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M145 86H0V0H145V86ZM86.6025 19.5L64.3008 31.5H5V81H140V5H86.6025V19.5ZM5 26.5H63.041L81.6025 16.5127V5H5V26.5Z" fill="black" />
                <text x="20" y="18" fontSize="12" fill="black" fontFamily="monospace" fontWeight="bold">opt</text>
            </svg>
        ),
        nodeType: 'optFragment',
        label: 'Opt (Opcional)',
    },
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="145" height="86" viewBox="0 0 145 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M145 86H0V0H145V86ZM86.6025 19.5L64.3008 31.5H5V81H140V5H86.6025V19.5ZM5 26.5H63.041L81.6025 16.5127V5H5V26.5Z" fill="black" />
                <text x="15" y="18" fontSize="11" fill="black" fontFamily="monospace" fontWeight="bold">loop(0..*)</text>
            </svg>
        ),
        nodeType: 'loopFragment',
        label: 'Loop (Bucle)',
    },
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="145" height="86" viewBox="0 0 145 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M145 86H0V0H145V86ZM86.6025 19.5L64.3008 31.5H5V81H140V5H86.6025V19.5ZM5 26.5H63.041L81.6025 16.5127V5H5V26.5Z" fill="black" />
                <text x="15" y="18" fontSize="11" fill="black" fontFamily="monospace" fontWeight="bold">break</text>
            </svg>
        ),
        nodeType: 'breakFragment',
        label: 'Break (Interrupción)',
    },
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="145" height="86" viewBox="0 0 145 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M145 86H0V0H145V86ZM86.6025 19.5L64.3008 31.5H5V81H140V5H86.6025V19.5ZM5 26.5H63.041L81.6025 16.5127V5H5V26.5Z" fill="black" />
                <path d="M5 45 L140 45" stroke="black" strokeWidth="1" strokeDasharray="4 4" />
                <text x="20" y="18" fontSize="12" fill="black" fontFamily="monospace" fontWeight="bold">seq</text>
            </svg>
        ),
        nodeType: 'seqFragment',
        label: 'Seq (Orden Débil)',
    },
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="145" height="86" viewBox="0 0 145 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M145 86H0V0H145V86ZM86.6025 19.5L64.3008 31.5H5V81H140V5H86.6025V19.5ZM5 26.5H63.041L81.6025 16.5127V5H5V26.5Z" fill="black" />
                <path d="M5 45 L140 45" stroke="black" strokeWidth="1" strokeDasharray="4 4" />
                <text x="15" y="18" fontSize="11" fill="black" fontFamily="monospace" fontWeight="bold">strict</text>
            </svg>
        ),
        nodeType: 'strictFragment',
        label: 'Strict (Orden Estricto)',
    },
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="145" height="86" viewBox="0 0 145 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M145 86H0V0H145V86ZM86.6025 19.5L64.3008 31.5H5V81H140V5H86.6025V19.5ZM5 26.5H63.041L81.6025 16.5127V5H5V26.5Z" fill="black" />
                <path d="M5 45 L140 45" stroke="black" strokeWidth="1" strokeDasharray="4 4" />
                <text x="20" y="18" fontSize="12" fill="black" fontFamily="monospace" fontWeight="bold">par</text>
            </svg>
        ),
        nodeType: 'parFragment',
        label: 'Par (Concurrente)',
    },
];
        separator: 'Otros',
        svg: '',
        nodeType: '',
        label: ''
    },
    {
        svg: (
            <svg
                className="w-full h-full"
                width="67"
                height="38"
                viewBox="0 0 67 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M1 38H0L0 1H1L1 38Z"
                    fill="none"
                    className="stroke-black dark:stroke-white"
                    strokeWidth="2"
                />

                <path
                    d="M65 37V38L0 38L0 37L65 37Z"
                    fill="none"
                    className="stroke-black dark:stroke-white"
                    strokeWidth="2"
                />

                <path
                    d="M54 0V1H0V0H54Z"
                    fill="none"
                    className="stroke-black dark:stroke-white"
                    strokeWidth="2"
                />

                <path
                    d="M65 12H66V38H65V12Z"
                    fill="none"
                    className="stroke-black dark:stroke-white"
                    strokeWidth="2"
                />

                <path
                    d="M54 12H53V0L54 0V12Z"
                    fill="none"
                    className="stroke-black dark:stroke-white"
                    strokeWidth="2"
                />

                <path
                    d="M65 12V13H53V12H65Z"
                    fill="none"
                    className="stroke-black dark:stroke-white"
                    strokeWidth="2"
                />

                <line
                    x1="53.3536"
                    y1="0.646447"
                    x2="65.3536"
                    y2="12.6464"
                    className="stroke-black dark:stroke-white"
                    strokeWidth="2"
                />
            </svg>
        ),
        nodeType: 'note',
        label: 'Nota UML',
        grouped: true
    }
];
