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
export const customModal = (options: {
  title: string;
  text?: string;
  html?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  isDanger?: boolean; 
}) => {
  const theme = getSwalTheme();
  document.body.classList.add('no-blur');

  return Swal.fire({
    ...theme,
    title: options.title,
    text: options.text,
    html: options.html,
    icon: options.icon,
    iconColor: options.isDanger ? '#ef4444' : undefined, 

    showCancelButton: options.showCancel ?? false,
    confirmButtonText: options.confirmText || 'Aceptar',
    cancelButtonText: options.cancelText || 'Cancelar',

    customClass: {
      ...theme.customClass,
      confirmButton: options.isDanger
        ? 'bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-full transition'
        : theme.customClass.confirmButton,
    },
    willClose: () => {
      document.body.classList.remove('no-blur'); 
    }
  });
};

export const selectDiagramTypeAlert = async () => {
  const theme = getSwalTheme();
  document.body.classList.add('no-blur');

  return Swal.fire({
    ...theme,
    title: '',

    html: `
      <div class="flex flex-col items-center text-center">

        <!-- ICONO -->
        <div class="w-16 h-16 flex items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg"
            class="w-8 h-8 text-sky-600 dark:text-sky-400"
            fill="currentColor" viewBox="0 0 16 16">
            <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.1 6.1 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.1 8.1 0 0 1-3.078.132 4 4 0 0 1-.562-.135 1.4 1.4 0 0 1-.466-.247.7.7 0 0 1-.204-.288.62.62 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896q.19.012.348.048c.062-.172.142-.380.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04"/>
          </svg>
        </div>

        <!-- TITULO -->
        <h2 class="text-xl font-bold mb-2">
          ¿Qué tipo de diagrama deseas modelar?
        </h2>

      </div>

      <!-- OPCIONES -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        <!-- SECUENCIA -->
        <div id="seq-option"
          class="cursor-pointer p-6 rounded-2xl overflow-hidden border-2 border-sky-200 dark:border-sky-700 
          hover:border-sky-400 transition-all duration-300 ease-out 
          hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
          
          <div class="w-14 h-14 rounded-xl bg-sky-600 flex items-center justify-center mb-4 mx-auto">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
            </svg>
          </div>

          <h3 class="font-bold text-lg mb-1 text-center">Diagrama de Secuencia</h3>
          <p class="text-sm text-zinc-500 text-center">
            Modela interacciones entre objetos en el tiempo
          </p>
        </div>

        <!-- ACTIVIDADES -->
        <div id="act-option"
          class="cursor-pointer p-6 rounded-2xl overflow-hidden border-2 border-green-200 dark:border-green-700 
          hover:border-green-400 transition-all duration-300 ease-out 
          hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
          
          <div class="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center mb-4 mx-auto">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
            </svg>
          </div>

          <h3 class="font-bold text-lg mb-1 text-center">Diagrama de Actividades</h3>
          <p class="text-sm text-zinc-500 text-center">
            Representa flujos de trabajo y procesos
          </p>
        </div>

      </div>
    `,

    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Cancelar',

    width: window.innerWidth < 768 ? '95%' : '900px',

    customClass: {
      ...theme.customClass,
      cancelButton:
        'bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-full transition',
    },

    showClass: {
      popup: 'animate__animated animate__zoomIn animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__zoomOut animate__faster'
    },

    didOpen: () => {
      const seq = document.getElementById('seq-option');
      const act = document.getElementById('act-option');

      seq?.addEventListener('click', () => {
        Swal.close();
        window.dispatchEvent(new CustomEvent('diagram:selected', { detail: 'secuencia' }));
      });

      act?.addEventListener('click', () => {
        Swal.close();
        window.dispatchEvent(new CustomEvent('diagram:selected', { detail: 'actividades' }));
      });
    },

    willClose: () => {
      document.body.classList.remove('no-blur');
    }
  });
};

export const selectExportFormatAlert = async () => {
  const theme = getSwalTheme();
  document.body.classList.add('no-blur');

  return Swal.fire({
    ...theme,
    title: 'Exportar diagrama',

    html: `
      <div class="flex flex-col items-center text-center">
        <div class="w-16 h-16 flex items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-8 h-8 text-sky-600 dark:text-sky-400">
            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold mb-2">
          ¿En qué formato quieres exportar?
        </h2>
      </div>

      <div class="grid grid-cols-2 gap-6 mt-6">
        <div id="png-option"
          class="cursor-pointer p-6 rounded-2xl border-2 border-sky-200 dark:border-sky-700 
          hover:border-sky-400 transition-all hover:scale-105">
          <h3 class="font-bold text-lg text-center">PNG</h3>
          <p class="text-sm text-zinc-500 text-center">
            Imagen del diagrama
          </p>
        </div>
        <div id="pdf-option"
          class="cursor-pointer p-6 rounded-2xl border-2 border-red-200 dark:border-red-700 
          hover:border-red-400 transition-all hover:scale-105">
          <h3 class="font-bold text-lg text-center">PDF</h3>
          <p class="text-sm text-zinc-500 text-center">
            Documento listo para compartir
          </p>
        </div>
      </div>
    `,

    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Cancelar',

    didOpen: () => {
      const png = document.getElementById('png-option');
      const pdf = document.getElementById('pdf-option');

      png?.addEventListener('click', () => {
        Swal.close();
        window.dispatchEvent(new CustomEvent('export:selected', { detail: 'png' }));
      });

      pdf?.addEventListener('click', () => {
        Swal.close();
        window.dispatchEvent(new CustomEvent('export:selected', { detail: 'pdf' }));
      });
    },

    willClose: () => {
      document.body.classList.remove('no-blur');
    }
  });
};

export const renameDiagramAlert = async (currentName: string) => {
  const theme = getSwalTheme();
  document.body.classList.add('no-blur');

  return Swal.fire({
    ...theme,

    title: 'Renombrar diagrama',

    html: `
      <div class="flex flex-col items-center gap-2">
          <span class="font-bold text-lg">Renombrar diagrama</span>

        <p class="text-sm text-zinc-500">
          Escribe el nuevo nombre del diagrama
        </p>

      </div>
    `,
    input: 'text',
    inputValue: currentName,
    inputPlaceholder: 'Nuevo nombre...',

    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',

    customClass: {
      ...theme.customClass,
      confirmButton:
        'bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2 rounded-full transition',
      cancelButton:
        'bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-full transition',
    },

    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off'
    },

    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return 'El nombre no puede estar vacío';
      }
      if (value.length > 50) {
        return 'Máximo 50 caracteres';
      }
      return null;
    },

    showClass: {
      popup: 'animate__animated animate__zoomIn animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__zoomOut animate__faster'
    },

    willClose: () => {
      document.body.classList.remove('no-blur');
    }
  });
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
        'bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-full transition cursor-pointer',
    },
  });
};

export const confirmExitUnsaved = async () => {
  return Swal.fire({
    ...getSwalTheme(),
    title: 'Cambios sin guardar',
    text: 'El diagrama tiene cambios que aún no se han guardado en el servidor.',
    icon: 'warning',
    iconColor: '#f59e0b',
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: 'Guardar y salir',
    denyButtonText: 'Salir de todas formas',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      ...getSwalTheme().customClass,
      confirmButton:
        'bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2 rounded-full transition cursor-pointer',
      denyButton:
        'bg-transparent border border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 dark:text-red-400 font-semibold px-5 py-2 rounded-full transition cursor-pointer',
    },
  });
};

export const confirmRestoreAutoSave = async () => {
  return Swal.fire({
    ...getSwalTheme(),
    title: 'Autoguardado encontrado',
    text: 'Se encontró una versión guardada localmente. ¿Deseas recuperarla?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, recuperar',
    cancelButtonText: 'No recuperar',
    reverseButtons: true,
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
