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
  // ¡YA NO USAMOS IonList, IonItem, IonLabel, ni IonRouterLink!
  IonInput, // Solo necesitamos IonInput
  IonButton,
  IonAlert
} from '@ionic/react';
import { useHistory } from 'react-router';

const Registro: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const history = useHistory();

  /**
   * (E) Función handleRegister (Sin cambios)
   */
  const handleRegister = async () => {
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
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
            
            {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN! --- */}
            {/* Borramos la IonList y usamos IonInput con 'label' */}

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

            {/* --- FIN DE LA CORRECCIÓN --- */}
            
            <IonButton expand="block" onClick={handleRegister} className="ion-margin-top">
              Registrarme
            </IonButton>
            <IonButton expand="block" routerLink="/login" color="light" className="ion-margin-top">
              ¿Ya tienes cuenta? Inicia Sesión
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Alertas (Sin cambios) */}
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