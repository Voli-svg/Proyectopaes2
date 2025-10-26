import React, { useState } from 'react'; // Removed useEffect as fetchMazo is gone from here
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton,
  IonLoading, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonText
} from '@ionic/react';
// --- ¡NUEVO! --- Importamos useHistory para navegar
import { useHistory } from 'react-router-dom';
import './Tab1.css';

// Interface Pregunta and EstadoJuego type remain (though we won't load questions here anymore)
interface Pregunta {
  id: string; tema: string; pregunta: string; opciones: string[];
  respuesta_correcta: string; explicacion: string;
}
type EstadoJuego = 'seleccion_tema' | 'cargando' | 'mostrando' | 'respondido' | 'finalizado' | 'juego_terminado';

const Tab1: React.FC = () => {
  // --- ¡NUEVO! --- Obtenemos el objeto history
  const history = useHistory();

  // We keep the estadoJuego to show the menu, but remove other quiz-related states
  const [estadoJuego, setEstadoJuego] = useState<EstadoJuego>('seleccion_tema');
  // Removed states: mazo, indicePregunta, puntaje, seleccion, esCorrecto, explicacion, vidas, xp, racha, bonus, opcionesFallidas, rachaMaxima

  // Removed functions related to the quiz:
  // guardarProgreso, fetchMazo, handleRespuesta, handleSiguiente, volverAlMenu, getBotonColor

  // Function to handle clicking a main subject button
  const handleMateriaClick = (materiaIdentificador: string) => {
    // Navigate to the TemaMenu page, passing the identifier in the URL
    history.push(`/menu/${materiaIdentificador}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {/* Title can be "Menu Principal" or similar */}
          <IonTitle>Menú Principal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">

        {/* --- Menú Principal (seleccion_tema state) --- */}
        {/* We only need this part now in Tab1 */}
        {estadoJuego === 'seleccion_tema' && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Selecciona una Materia</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {/* --- Botón Matemáticas M1 --- */}
              {/* 👇 Updated onClick handler */}
              <IonButton
                expand="block"
                onClick={() => handleMateriaClick('Matematicas_M1')} // <-- Navigates
                className="ion-margin-bottom"
                color="primary"
              >
                Matemáticas M1
              </IonButton>

              {/* --- Botón Lenguaje --- */}
              {/* 👇 Updated onClick handler */}
              <IonButton
                expand="block"
                onClick={() => handleMateriaClick('Lenguaje')} // <-- Navigates
                color="secondary"
                className="ion-margin-bottom"
              >
                Lenguaje (Comp. Lectora)
              </IonButton>

              {/* --- Botón Ciencias --- */}
              {/* 👇 Updated onClick handler */}
              <IonButton
                expand="block"
                onClick={() => handleMateriaClick('Ciencias_Comun')} // <-- Navigates
                color="tertiary"
                className="ion-margin-bottom"
              >
                Ciencias (Común)
              </IonButton>

              {/* --- Botón Matemáticas M2 --- */}
              {/* 👇 Updated onClick handler */}
              <IonButton
                expand="block"
                onClick={() => handleMateriaClick('Matematicas_M2')} // <-- Navigates
                color="warning"
                 className="ion-margin-bottom"
             >
                Matemáticas M2
              </IonButton>

              {/* --- Botón Historia --- */}
              {/* 👇 Updated onClick handler */}
              <IonButton
                expand="block"
                onClick={() => handleMateriaClick('Historia')} // <-- Navigates
                color="medium"
              >
                Historia y Cs. Sociales
              </IonButton>

            </IonCardContent>
          </IonCard>
        )}

        {/* --- We REMOVE all the other states (cargando, mostrando, respondido, etc.) --- */}
        {/* --- because Tab1 is now ONLY the main menu --- */}

      </IonContent>
    </IonPage>
  );
};

export default Tab1; // This component is now effectively the MainMenu