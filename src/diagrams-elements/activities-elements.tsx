
export const ACTIVITY_NODES = [
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="74" height="47" viewBox="0 0 74 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="2" width="55" height="43" rx="3" fill="#D9D9D9" stroke="black" stroke-width="4" />
                <rect y="11" width="16" height="11" fill="white" />
                <rect y="11" width="16" height="11" fill="black" />
                <rect y="28" width="16" height="9" fill="white" />
                <rect y="28" width="16" height="9" fill="black" />
                <rect x="59" y="11" width="15" height="11" fill="white" />
                <rect x="59" y="11" width="15" height="11" fill="black" />
                <rect x="59" y="28" width="15" height="9" fill="white" />
                <rect x="59" y="28" width="15" height="9" fill="black" />
            </svg>
        ),
        nodeType: 'default',
        label: 'Actividad'
    },
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="52" height="41" viewBox="0 0 52 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="48" height="37" rx="8" stroke="black" strokeWidth="4" />
            </svg>
        ),
        nodeType: 'default',
        label: 'Acción simple'
    },
    {
        svg: (
            <svg className="w-full h-full dark:fill-white dark:stroke-white" width="33" height="24" viewBox="0 0 33 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32.0607 13.0607C32.6464 12.4749 32.6464 11.5251 32.0607 10.9393L22.5147 1.3934C21.9289 0.807612 20.9792 0.807612 20.3934 1.3934C19.8076 1.97918 19.8076 2.92893 20.3934 3.51472L28.8787 12L20.3934 20.4853C19.8076 21.0711 19.8076 22.0208 20.3934 22.6066C20.9792 23.1924 21.9289 23.1924 22.5147 22.6066L32.0607 13.0607ZM0 12L0 13.5L31 13.5V12V10.5L0 10.5L0 12Z" fill="black" />
            </svg>
        ),
        nodeType: 'default',
        label: 'Flecha'
    },
    {
        separator: true,
        separatorLabel: 'Eventos basados en acciones',
        svg: '',
        nodeType: '',
        label: ''
    },
];