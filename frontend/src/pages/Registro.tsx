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
  IonInput, // Usamos IonInput directamente
  IonButton,
  IonAlert,
} from '@ionic/react';
import { useHistory } from 'react-router';

const Registro: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const history = useHistory();

  // Define la URL base de la API usando la variable de entorno
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleRegister = async () => {
    setError(null);
    if (!apiUrl) { // Verificación extra por si la variable no está definida
      setError("La URL de la API no está configurada.");
      return;
    }
    try {
      // --- CAMBIO AQUÍ ---
      // Usamos la variable apiUrl en lugar de la URL fija
      const response = await fetch(`${apiUrl}/api/register`, {
      // --- FIN CAMBIO ---
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      setShowSuccess(true);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registro - App PAES</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Crear Cuenta</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* Inputs actualizados sin IonList */}
            <IonInput
              label="Usuario"
              labelPlacement="floating"
              fill="outline"
              className="ion-margin-bottom"
              value={username}
              onIonChange={(e) => setUsername(e.detail.value!)}
            />
            <IonInput
              label="Contraseña"
              labelPlacement="floating"
              fill="outline"
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
            {/* Fin Inputs */}

            <IonButton expand="block" onClick={handleRegister} className="ion-margin-top">
              Registrarme
            </IonButton>
            <IonButton expand="block" routerLink="/login" color="light" className="ion-margin-top">
              ¿Ya tienes cuenta? Inicia Sesión
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Alertas (sin cambios) */}
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header={'Error en Registro'}
          message={error || ''}
          buttons={['OK']}
        />
        <IonAlert
          isOpen={showSuccess}
          onDidDismiss={() => history.push('/login')}
          header={'¡Éxito!'}
          message={'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Registro;