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
  IonAlert // <-- 1. Importa IonAlert
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';

interface TemaMenuParams {
  materia: string;
}

const TemaMenu: React.FC = () => {
  const { materia } = useParams<TemaMenuParams>();
  const history = useHistory();

  const [temas, setTemas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 2. Nuevos Estados ---
  const [mostrarAlertaDuracion, setMostrarAlertaDuracion] = useState(false);
  const [temaSeleccionadoTemp, setTemaSeleccionadoTemp] = useState<string | null>(null);
  // --- Fin Nuevos Estados ---

  useEffect(() => {
    const fetchTemas = async () => {
      // ... (lógica fetchTemas sin cambios) ...
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/temas/${materia}`);
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
  }, [materia]);

  // --- 3. handleTemaClick ahora abre la alerta ---
  const handleTemaClick = (tema: string) => {
    setTemaSeleccionadoTemp(tema); // Guarda el tema temporalmente
    setMostrarAlertaDuracion(true); // Muestra la alerta
  };
  // --- Fin handleTemaClick ---

  // --- 4. Nueva función para iniciar el quiz ---
  const iniciarQuiz = (duracion: number) => {
    if (!temaSeleccionadoTemp) return; // Seguridad
    console.log(`Iniciando quiz para tema: ${temaSeleccionadoTemp}, Duración: ${duracion}`);
    // Navegamos a /quiz/, pasando tema y duración como parámetros de URL
    // Ej: /quiz/Algebra%20y%20Funciones/15
    history.replace(`/quiz/${encodeURIComponent(temaSeleccionadoTemp)}/${duracion}`);
    setTemaSeleccionadoTemp(null); // Limpia el tema temporal
  };
  // --- Fin iniciarQuiz ---

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

        {error && ( /* ... (manejo de error sin cambios) ... */
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
                    onClick={() => handleTemaClick(tema)} // Llama a la función que abre la alerta
                  >
                    <IonLabel>{tema}</IonLabel>
                  </IonItem>
                ))}
                {temas.length === 0 && ( /* ... (mensaje sin temas sin cambios) ... */
                   <IonItem><IonLabel color="medium">No se encontraron ejes.</IonLabel></IonItem>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {/* --- ¡NUEVA ALERTA DE DURACIÓN! --- */}
        <IonAlert
          isOpen={mostrarAlertaDuracion}
          onDidDismiss={() => setMostrarAlertaDuracion(false)} // Cierra la alerta si se cancela
          header={'Selecciona Duración'}
          message={'¿Cuántas preguntas quieres responder?'}
          inputs={[ // Opciones tipo radio
            { name: 'duracion', type: 'radio', label: '15 Preguntas', value: 15, checked: true },
            { name: 'duracion', type: 'radio', label: '30 Preguntas', value: 30 },
            { name: 'duracion', type: 'radio', label: '60 Preguntas', value: 60 },
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setTemaSeleccionadoTemp(null) }, // Limpia tema si cancela
            { text: 'Empezar', handler: (data) => iniciarQuiz(data) } // Llama a iniciarQuiz con el valor seleccionado
          ]}
        />
        {/* --- FIN ALERTA --- */}

      </IonContent>
    </IonPage>
  );
};

export default TemaMenu;