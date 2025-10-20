import React, { useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton,
  IonLoading, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonText
} from '@ionic/react';
import './Tab1.css';

interface Pregunta {
  id: string; tema: string; pregunta: string; opciones: string[];
  respuesta_correcta: string; explicacion: string;
}
type EstadoJuego = 'seleccion_tema' | 'cargando' | 'mostrando' | 'respondido' | 'finalizado' | 'juego_terminado';

const Tab1: React.FC = () => {
  const [mazo, setMazo] = useState<Pregunta[]>([]);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [estadoJuego, setEstadoJuego] = useState<EstadoJuego>('seleccion_tema');
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [esCorrecto, setEsCorrecto] = useState<boolean | null>(null);
  const [explicacion, setExplicacion] = useState<string | null>(null);
  const [vidas, setVidas] = useState(5);
  const [xp, setXp] = useState(0);
  const [racha, setRacha] = useState(0);
  const [bonus, setBonus] = useState(false);
  const [opcionesFallidas, setOpcionesFallidas] = useState<string[]>([]);
  const [rachaMaxima, setRachaMaxima] = useState(0);

  const preguntaActual = mazo[indicePregunta];

  const guardarProgreso = async (xpGanado: number) => {
    if (xpGanado <= 0) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await fetch('http://127.0.0.1:5000/api/user/update_xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
          // Usamos ` (backticks), no ' (comillas simples)
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ xp_ganado: xpGanado })
      });
    } catch (error) {
      console.error("Error al guardar el progreso:", error);
    }
  };

  const fetchMazo = async (tema: string) => {
    setEstadoJuego('cargando');
    setMazo([]);
    setIndicePregunta(0);
    setPuntaje(0);
    setSeleccion(null);
    setEsCorrecto(null);
    setExplicacion(null);
    setVidas(5);
    setXp(0);
    setOpcionesFallidas([]);
    setRacha(0);
    setBonus(false);
    setRachaMaxima(0); 
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/preguntas/${tema}`);
      if (!response.ok) { throw new Error(`No se encontró el tema ${tema}`); }
      const data = await response.json();
      setMazo(data.preguntas);
      setEstadoJuego('mostrando');
    } catch (error) {
      console.error("Error al cargar el mazo:", error);
      setEstadoJuego('seleccion_tema'); 
    }
  };

  const handleRespuesta = (opcionSeleccionada: string) => {
    if (opcionesFallidas.includes(opcionSeleccionada) || estadoJuego === 'respondido') {
      return;
    }
    const correcta = preguntaActual.respuesta_correcta;
    if (opcionSeleccionada === correcta) {
      const nuevaRacha = racha + 1;
      setRacha(nuevaRacha);
      if (nuevaRacha > rachaMaxima) {
        setRachaMaxima(nuevaRacha);
      }
      let xpGanado = 10;
      if (nuevaRacha % 5 === 0 && nuevaRacha > 0) {
        xpGanado += 50;
        setBonus(true);
      } else {
        setBonus(false);
      }
      setXp(xp + xpGanado);
      setPuntaje(puntaje + 1); 
      setEsCorrecto(true);
      setSeleccion(opcionSeleccionada);
      setExplicacion(preguntaActual.explicacion);
      setEstadoJuego('respondido');
    } else {
      setEsCorrecto(false);
      setRacha(0);
      setBonus(false);
      setOpcionesFallidas([...opcionesFallidas, opcionSeleccionada]);
      const nuevasVidas = vidas - 1;
      setVidas(nuevasVidas);
      if (nuevasVidas <= 0) {
        guardarProgreso(xp); 
        setEstadoJuego('juego_terminado');
      }
    }
  };
  
  const handleSiguiente = () => {
    const proximoIndice = indicePregunta + 1;
    if (proximoIndice < mazo.length) {
      setIndicePregunta(proximoIndice);
      setEstadoJuego('mostrando');
      setSeleccion(null);
      setEsCorrecto(null);
      setExplicacion(null);
      setOpcionesFallidas([]);
      setBonus(false);
    } else {
      guardarProgreso(xp);
      setEstadoJuego('finalizado');
    }
  };

  const volverAlMenu = () => {
    setEstadoJuego('seleccion_tema');
    setExplicacion(null);
    setOpcionesFallidas([]);
    setRacha(0);
    setBonus(false);
    setRachaMaxima(0); 
  }
  const getBotonColor = (opcion: string) => {
    if (estadoJuego === 'respondido') {
      if (opcion === preguntaActual.respuesta_correcta) return 'success';
      if (opcionesFallidas.includes(opcion)) return 'danger';
      return 'medium';
    }
    if (estadoJuego === 'mostrando') {
      if (opcionesFallidas.includes(opcion)) return 'danger';
      return 'medium';
    }
    return 'medium';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Práctica PAES V1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        
        <IonLoading
          isOpen={estadoJuego === 'cargando'}
          message={'Cargando preguntas...'}
        />

        {estadoJuego === 'seleccion_tema' && (
          <IonCard>
            <IonCardHeader><IonCardTitle>Selecciona un Tema</IonCardTitle></IonCardHeader>
            <IonCardContent>
              <IonButton expand="block" onClick={() => fetchMazo('Álgebra')} className="ion-margin-bottom">
                Práctica de Álgebra
              </IonButton>
              <IonButton expand="block" onClick={() => fetchMazo('Historia')} color="secondary">
                Práctica de Historia
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
        
        {preguntaActual && (estadoJuego === 'mostrando' || estadoJuego === 'respondido') && (
          <>
            <div className="ion-text-center ion-margin-bottom">
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 10px' }}>
                <IonText color="danger"><h2 style={{ margin: 0 }}>❤️ {vidas}</h2></IonText>
                <IonText color="warning"><h2 style={{ margin: 0 }}>🔥 {racha}</h2></IonText>
                <IonText color="success"><h2 style={{ margin: 0 }}>{xp} XP</h2></IonText>
              </div>
              <IonText color="medium" style={{ marginTop: '8px' }}>
                <p>Pregunta {indicePregunta + 1} de {mazo.length} ({preguntaActual.tema})</p>
              </IonText>
            </div>

            <IonCard>
              <IonCardHeader><IonCardTitle>{preguntaActual.tema}</IonCardTitle></IonCardHeader>
              <IonCardContent>{preguntaActual.pregunta}</IonCardContent>
            </IonCard>
            <IonList>
              {preguntaActual.opciones.map((opcion) => (
                <IonItem
                  key={opcion}
                  button
                  onClick={() => handleRespuesta(opcion)}
                  disabled={
                    estadoJuego === 'respondido' ||
                    opcionesFallidas.includes(opcion)
                  }
                  color={getBotonColor(opcion)}
                >
                  <IonLabel>{opcion}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </>
        )}

        {estadoJuego === 'respondido' && (
          <div className="ion-text-center ion-margin-top">
            <h2 style={{ color: 'var(--ion-color-success)' }}>¡Correcto!</h2>
            {bonus && (
              <IonText color="success">
                <h3>¡Bonus de Racha! +50 XP</h3>
              </IonText>
            )}
            {explicacion && (
              <IonCard color="light" className="ion-margin-top">
                <IonCardHeader><IonCardTitle>Explicación</IonCardTitle></IonCardHeader>
                <IonCardContent className="ion-text-left">
                  {explicacion}
                </IonCardContent>
              </IonCard>
            )}
            <IonButton expand="block" onClick={handleSiguiente} className="ion-margin-top">
              Siguiente
            </IonButton>
          </div>
        )}
        
        {estadoJuego === 'finalizado' && (
          <div className="ion-text-center ion-margin-top">
            <h2>¡Práctica Completada! 🏆</h2>
            <IonText color="primary"><h3>Puntaje Final: {puntaje} de {mazo.length}</h3></IonText> 
            <IonText color="success"><h3>XP Obtenido: {xp}</h3></IonText>
            <IonText color="warning"><h3>Racha Máxima: {rachaMaxima}</h3></IonText> 
            <IonButton expand="block" onClick={volverAlMenu}>
              Volver al Menú
            </IonButton>
          </div>
        )}

        {estadoJuego === 'juego_terminado' && (
          <div className="ion-text-center ion-margin-top">
            <h1 style={{ fontSize: '3rem' }}>💔</h1>
            <h2>¡Te quedaste sin vidas!</h2>
            <IonText color="primary"><h3>Puntaje Final: {puntaje} de {mazo.length}</h3></IonText>
            <IonText color="success"><h3>XP Obtenido: {xp}</h3></IonText>
            <IonText color="warning"><h3>Racha Máxima: {rachaMaxima}</h3></IonText>
            <IonButton expand="block" onClick={volverAlMenu} className="ion-margin-top">
              Volver al Menú
            </IonButton>
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default Tab1;