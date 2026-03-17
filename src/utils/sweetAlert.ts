import Swal from 'sweetalert2';

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
        'bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2 rounded-full transition',
      cancelButton:
        'bg-gray-300 hover:bg-gray-400 dark:bg-zinc-600 dark:hover:bg-zinc-500 text-black dark:text-white font-semibold px-5 py-2 rounded-full transition',
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