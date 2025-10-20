import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  // ¡YA NO USAMOS IonList, IonItem, ni IonLabel!
  IonInput, // Solo necesitamos IonInput
  IonButton,
  IonAlert
} from '@ionic/react';
import { useHistory } from 'react-router';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  /**
   * (E) Función handleLogin (Sin cambios)
   */
  const handleLogin = async () => {
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      localStorage.setItem('access_token', data.access_token);
      history.push('/tabs/tab1');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login - App PAES</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Iniciar Sesión</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            
            {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN! --- */}
            {/* Borramos la IonList y usamos IonInput con 'label' */}
            
            <IonInput
              label="Usuario" // La etiqueta va aquí
              labelPlacement="floating" // Para que flote
              fill="outline" // Con un borde
              className="ion-margin-bottom" // Para dar espacio
              value={username}
              onIonChange={(e) => setUsername(e.detail.value!)}
            />
            
            <IonInput
              label="Contraseña" // La etiqueta va aquí
              labelPlacement="floating"
              fill="outline"
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
            
            {/* --- FIN DE LA CORRECCIÓN --- */}

            <IonButton expand="block" onClick={handleLogin} className="ion-margin-top">
              Iniciar Sesión
            </IonButton>
            <IonButton expand="block" routerLink="/registro" color="light" className="ion-margin-top">
              ¿No tienes cuenta? Regístrate
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Alerta de Error (Sin cambios) */}
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header={'Error en Login'}
          message={error || ''}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;