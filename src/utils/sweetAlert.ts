import Swal from 'sweetalert2';

export type LifeLineHeaderIcon = 'rectangle' | 'user' | 'database' | 'server' | 'circle';

//Tema dinámico 
const getSwalTheme = () => {
  const isDark = document.documentElement.classList.contains('dark');

  return {
    buttonsStyling: false,
    background: isDark ? '#27272a' : '#ffffff',
    color: isDark ? '#f4f4f5' : '#18181b',

    customClass: {
      popup: '!rounded-[32px] p-8 shadow-2xl', 
      title: 'text-xl font-bold',
      htmlContainer: 'text-sm mt-2',
      actions: 'flex justify-center gap-4 mt-6',
      confirmButton:
        'bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2 rounded-full transition cursor-pointer',
      cancelButton:
        'bg-gray-300 hover:bg-gray-400 dark:bg-zinc-600 dark:hover:bg-zinc-500 text-black dark:text-white font-semibold px-5 py-2 rounded-full transition cursor-pointer',
    },
  };
};

//Alerta de error
export const errorAlert = (title: string, text?: string) => {
  return Swal.fire({
    ...getSwalTheme(),
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    customClass: {
      ...getSwalTheme().customClass,
      confirmButton:
        'bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-full transition',
    },
  });
};

//Alerta tipo loading
export const loadingAlert = (title: string = 'Cargando...') => {
  Swal.fire({
    ...getSwalTheme(),
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

//Alerta de éxito 
export const successAlert = (title: string, htmlText?: string) => {
  return Swal.fire({
    ...getSwalTheme(),
    title,
    html: htmlText ? `<p class="text-lg mt-2">${htmlText}</p>` : undefined,
    icon: 'success',
    confirmButtonText: 'OK',
  });
};


//Cerrar cualquier alerta
export const closeAlert = () => {
  Swal.close();
};

//Confirmar salida sin guardar
export const confirmExitWithoutSaving = async () => {
  return Swal.fire({
    ...getSwalTheme(),
    title: '¿Salir sin guardar?',
    text: 'Se perderán los cambios no guardados',
    icon: 'warning',
    iconColor: '#ef4444',
    showCancelButton: true,
    confirmButtonText: 'Salir',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      ...getSwalTheme().customClass,
      confirmButton:
        'bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-full transition',
    },
  });
};

export const selectLifeLineHeaderIcon = async (
  currentIcon: LifeLineHeaderIcon = 'rectangle'
) => {
  const isDark = document.documentElement.classList.contains('dark');

  const options: { id: LifeLineHeaderIcon; label: string; svg: string }[] = [
    {
      id: 'rectangle',
      label: 'Rectángulo',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="6" width="16" height="12" rx="1.5" /></svg>',
    },
    {
      id: 'user',
      label: 'Actor',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="6.5" r="2.5" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m0 0-3.5 4M12 15l3.5 4m-8-7h9" /></svg>',
    },
    {
      id: 'database',
      label: 'Base de datos',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" /><path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" /></svg>',
    },
    {
      id: 'server',
      label: 'Servidor',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="16" height="6" rx="1.5" /><rect x="4" y="14" width="16" height="6" rx="1.5" /><circle cx="8" cy="7" r="0.9" fill="currentColor" /><circle cx="8" cy="17" r="0.9" fill="currentColor" /></svg>',
    },
    {
      id: 'circle',
      label: 'Círculo',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="7" /></svg>',
    },
  ];

  let selectedIcon: LifeLineHeaderIcon = currentIcon;

  const result = await Swal.fire({
    ...getSwalTheme(),
    title: 'Selecciona el ícono de la LifeLine',
    html: `
      <div id="lifeline-icon-grid" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px;">
        ${options
          .map(
            (opt) => `
              <button
                type="button"
                data-icon-option="${opt.id}"
                style="
                  border:1px solid ${isDark ? '#3f3f46' : '#d4d4d8'};
                  border-radius:12px;
                  padding:10px;
                  background:${isDark ? '#18181b' : '#f8fafc'};
                  color:${isDark ? '#f4f4f5' : '#18181b'};
                  cursor:pointer;
                  display:flex;
                  align-items:center;
                  gap:10px;
                  width:100%;
                "
              >
                <span style="display:inline-flex;width:26px;height:26px;">${opt.svg}</span>
                <span style="font-size:13px;font-weight:600;">${opt.label}</span>
              </button>
            `
          )
          .join('')}
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Aplicar',
    cancelButtonText: 'Cancelar',
    focusConfirm: false,
    didOpen: () => {
      const container = Swal.getHtmlContainer();
      if (!container) return;

      const highlightButton = (targetId: LifeLineHeaderIcon) => {
        const buttons = container.querySelectorAll<HTMLButtonElement>('[data-icon-option]');
        buttons.forEach((btn) => {
          const isSelected = btn.dataset.iconOption === targetId;
          btn.style.border = `2px solid ${isSelected ? '#0ea5e9' : isDark ? '#3f3f46' : '#d4d4d8'}`;
          btn.style.boxShadow = isSelected ? '0 0 0 2px rgba(14,165,233,0.2)' : 'none';
        });
      };

      highlightButton(selectedIcon);

      container.querySelectorAll<HTMLButtonElement>('[data-icon-option]').forEach((button) => {
        button.addEventListener('click', () => {
          selectedIcon = button.dataset.iconOption as LifeLineHeaderIcon;
          highlightButton(selectedIcon);
        });
      });
    },
    preConfirm: () => selectedIcon,
  });

  return result.isConfirmed ? (result.value as LifeLineHeaderIcon) : null;
};
