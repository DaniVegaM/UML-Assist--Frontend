import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Link, useNavigate } from 'react-router';
import { useTheme } from '../../hooks/useTheme';
import './Header.css';
import { getLoggedUser, clearStorage } from '../../helpers/auth';

export default function Header() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const logedInUser = getLoggedUser();
  console.log("logedInUser:", logedInUser);

  const isEmailProvider = logedInUser?.provider === 'email';
  console.log("isEmailProvider:", isEmailProvider);

  if (logedInUser) {
    console.log("Usuario logueado:", logedInUser.email, "Provider:", logedInUser.provider);
  } else {
    console.log("No hay usuario logueado");
  }


  return (
    <header className="bg-white dark:bg-zinc-800 shadow-md shadow-zinc-400 dark:shadow-zinc-700 md:rounded-4xl mb-4 md:my-4 md:max-w-11/12 md:mx-auto" >
      <Disclosure as="nav">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center space-x-2">
                    <svg
                      className="h-8 w-8 text-sky-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <line x1="10" y1="6.5" x2="14" y2="6.5" />
                      <line x1="10" y1="17.5" x2="14" y2="17.5" />
                      <line x1="6.5" y1="10" x2="6.5" y2="14" />
                      <line x1="17.5" y1="10" x2="17.5" y2="14" />
                    </svg>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      UML Assist
                    </span>
                  </Link>
                </div>

                <div className="hidden sm:flex sm:items-center gap-2">
                  <label htmlFor="switch" className="toggle">
                    <input
                      type="checkbox"
                      className="input"
                      id="switch"
                      checked={!isDarkMode}
                      onChange={toggleTheme}
                    />
                    <div className="icon icon--moon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="18"
                        height="18"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>

                    <div className="icon icon--sun">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="18"
                        height="18"
                      >
                        <path
                          d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
                        ></path>
                      </svg>
                    </div>
                  </label>

                  {logedInUser ?
                    <div>
                      <button
                        className="cursor-pointer text-gray-700 hover:text-sky-600 dark:text-white dark:hover:text-sky-600 dark:hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        onClick={() => { clearStorage(); navigate('/', { replace: true }); }}
                      >
                        Cerrar Sesión
                      </button>

                      {isEmailProvider && (
                        <Link
                          to="/cambiar-contrasena"
                          className="cursor-pointer text-gray-700 dark:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-sky-600 dark:hover:text-sky-600 dark:hover:bg-gray-200"
                        >
                          Mi perfil
                        </Link>
                      )}

                    </div>
                    :
                    <Link
                      to="/iniciar-sesion"
                      className="text-gray-700 hover:text-sky-600 dark:text-white dark:hover:text-sky-600 dark:hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                  }

                  <Link
                    to="/crear-cuenta"
                    className="uppercase bg-sky-600 text-white hover:bg-sky-700 px-4 py-2 rounded-4xl text-sm font-bold transition-colors shadow-sm"
                  >
                    {logedInUser ? 'Mis diagramas' : 'Crear Cuenta'}
                  </Link>
                </div>

                <div className="flex items-center sm:hidden">
                  <DisclosureButton className="cursor-pointer inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-white hover:bg-gray-100 hover:text-sky-600 transition-colors">
                    <span className="sr-only">Abrir menú principal</span>
                    {open ? (
                      <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    )}
                  </DisclosureButton>
                </div>
              </div>
            </div>

            <DisclosurePanel
              transition
              className="fixed inset-0 z-40 sm:hidden transition duration-200 ease-out data-[closed]:opacity-0"
            >
              <DisclosureButton
                as="div"
                className="fixed inset-0 bg-black/50 cursor-pointer"
                aria-hidden="true"
              />

              <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-zinc-800 shadow-2xl transform translate-x-0 transition-all duration-300 ease-out data-[closed]:translate-x-full data-[enter]:translate-x-0 data-[leave]:translate-x-full">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Menú</span>

                  <div className="flex items-center gap-3">
                    <label htmlFor="switch-mobile" className="toggle">
                      <input
                        type="checkbox"
                        className="input"
                        id="switch-mobile"
                        checked={!isDarkMode}
                        onChange={toggleTheme}
                      />
                      <div className="icon icon--moon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width="18"
                          height="18"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>

                      <div className="icon icon--sun">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width="18"
                          height="18"
                        >
                          <path
                            d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
                          ></path>
                        </svg>
                      </div>
                    </label>

                    <DisclosureButton className="cursor-pointer rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      <span className="sr-only">Cerrar menú</span>
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </DisclosureButton>
                  </div>
                </div>

                <div className="px-4 py-6 space-y-3">
                  <DisclosureButton
                    as={Link}
                    to="/iniciar-sesion"
                    className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-white dark:hover:text-sky-600 hover:bg-gray-100 hover:text-sky-600 transition-colors"
                  >
                    Iniciar Sesión
                  </DisclosureButton>
                  <DisclosureButton
                    as={Link}
                    to="/crear-cuenta"
                    className="uppercase block w-full text-center px-4 py-3 rounded-lg text-base font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm"
                  >
                    Crear Cuenta
                  </DisclosureButton>
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 dark:text-white text-center">
                    UML Assist © 2025
                  </p>
                </div>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </header>
  );
}
