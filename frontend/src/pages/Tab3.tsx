import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonProgressBar,
  IonLabel,
  IonLoading
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Tab3.css';

interface PerfilUsuario {
  username: string;
  total_xp: number;
}
const XP_POR_NIVEL = 100;

const Tab3: React.FC = () => {
  const history = useHistory();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        history.replace('/login');
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/api/user/profile', {
        headers: {
          // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
          // Usamos ` (backticks), no ' (comillas simples)
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudo cargar el perfil');
      }
      const data: PerfilUsuario = await response.json();
      setPerfil(data);

    } catch (error) {
      console.error("Error al cargar perfil:", error);
      history.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    history.replace('/login');
  };

  const calcularNivel = () => {
    if (!perfil) return { nivel: 1, progreso: 0, xpActualNivel: 0 };
    const nivel = Math.floor(perfil.total_xp / XP_POR_NIVEL) + 1;
    const xpActualNivel = perfil.total_xp % XP_POR_NIVEL;
    const progreso = xpActualNivel / XP_POR_NIVEL;
    return { nivel, progreso, xpActualNivel };
  };

  const { nivel, progreso, xpActualNivel } = calcularNivel();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil y Ajustes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonLoading isOpen={isLoading} message={"Cargando perfil..."} />

        {perfil && !isLoading && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>¡Hola, {perfil.username}!</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText color="primary"><h2>Nivel {nivel}</h2></IonText>
                <IonText color="medium"><p>Progreso al siguiente nivel:</p></IonText>
                <IonProgressBar value={progreso} className="ion-margin-vertical"></IonProgressBar>
                <IonText><p>{xpActualNivel} / {XP_POR_NIVEL} XP</p></IonText>
                <IonText color="medium" className="ion-margin-top">
                  <p>Total XP Acumulado: {perfil.total_xp}</p>
                </IonText>
              </IonCardContent>
            </IonCard>
            <IonCard>
              <IonCardHeader><IonCardTitle>Ajustes</IonCardTitle></IonCardHeader>
              <IonCardContent>
                <IonButton expand="block" color="danger" onClick={handleLogout}>
                  Cerrar Sesión
                </IonButton>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab3;