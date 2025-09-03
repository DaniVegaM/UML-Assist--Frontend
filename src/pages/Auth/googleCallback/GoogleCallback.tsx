import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { handleGoogleCallback } from "../../../services/authService";
import Loader from "../../../components/ui/Loader";


export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if ( error ) {
            console.error('Error en autenticación:', error);
            navigate('/iniciar-sesion?error=auth_failed', { replace: true });
            return;
        }

        if ( code ) {
            handleGoogleCallback(code)
                .then((result) => {
                    console.log('Autenticación exitosa:', result);
                    navigate('/', { replace: true });
                })
                .catch((error) => {
                    console.error('Error en callback:', error);
                    navigate('/iniciar-sesion?error=callback_failed', { replace: true });
                });
        } else {
            console.error('No se recibió código de autorización');
            navigate('/iniciar-sesion?error=no_code', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div>Procesando autenticación...</div>
            <Loader />
        </div>
    );
};