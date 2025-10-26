import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonLoading,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonAlert
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';

interface TemaMenuParams {
  materia: string;
}

const TemaMenu: React.FC = () => {
  const { materia } = useParams<TemaMenuParams>();
  const history = useHistory();

  // Define la URL base de la API
  const apiUrl = import.meta.env.VITE_API_URL;

  const [temas, setTemas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarAlertaDuracion, setMostrarAlertaDuracion] = useState(false);
  const [temaSeleccionadoTemp, setTemaSeleccionadoTemp] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemas = async () => {
      if (!apiUrl) { // Verifica apiUrl
        setError("La URL de la API no está configurada.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // --- CAMBIO AQUÍ ---
        const response = await fetch(`${apiUrl}/api/temas/${materia}`);
        // --- FIN CAMBIO ---
        if (!response.ok) {
          throw new Error(`No se pudieron cargar los temas para ${materia}. Status: ${response.status}`);
        }
        const data = await response.json();
        setTemas(data.temas || []);
      } catch (err: any) {
        console.error("Error fetching specific themes:", err);
        setError(err.message || 'Error desconocido al cargar temas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemas();
  }, [materia, apiUrl]); // Añadido apiUrl a dependencias

  const handleTemaClick = (tema: string) => {
    setTemaSeleccionadoTemp(tema);
    setMostrarAlertaDuracion(true);
  };

  const iniciarQuiz = (duracion: number) => {
    if (!temaSeleccionadoTemp) return;
    console.log(`Iniciando quiz para tema: ${temaSeleccionadoTemp}, Duración: ${duracion}`);
    history.replace(`/quiz/${encodeURIComponent(temaSeleccionadoTemp)}/${duracion}`);
    setTemaSeleccionadoTemp(null);
  };

  const formatMateriaName = (name: string) => {
    return name.replace(/_/g, ' ');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle>Ejes de {formatMateriaName(materia)}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonLoading isOpen={isLoading} message={'Cargando ejes temáticos...'} />

        {error && (
          <IonCard color="danger"><IonCardContent>{error}</IonCardContent></IonCard>
        )}

        {!isLoading && !error && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Selecciona un Eje Temático</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {temas.map((tema) => (
                  <IonItem
                    key={tema}
                    button
                    onClick={() => handleTemaClick(tema)}
                  >
                    <IonLabel>{tema}</IonLabel>
                  </IonItem>
                ))}
                {temas.length === 0 && (
                   <IonItem><IonLabel color="medium">No se encontraron ejes.</IonLabel></IonItem>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        <IonAlert
          isOpen={mostrarAlertaDuracion}
          onDidDismiss={() => setMostrarAlertaDuracion(false)}
          header={'Selecciona Duración'}
          message={'¿Cuántas preguntas quieres responder?'}
          inputs={[
            { name: 'duracion', type: 'radio', label: '15 Preguntas', value: 15, checked: true },
            { name: 'duracion', type: 'radio', label: '30 Preguntas', value: 30 },
            { name: 'duracion', type: 'radio', label: '60 Preguntas', value: 60 },
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setTemaSeleccionadoTemp(null) },
            { text: 'Empezar', handler: (data) => iniciarQuiz(data) }
          ]}
        />

      </IonContent>
    </IonPage>
  );
};

export default TemaMenu;