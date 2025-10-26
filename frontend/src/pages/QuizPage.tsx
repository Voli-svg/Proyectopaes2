import React, { useState, useEffect } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton,
  IonLoading, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonText, IonProgressBar,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import './Tab1.css'; // O renombra a QuizPage.css

interface Pregunta {
  id: string; tema: string; pregunta: string; opciones: string[];
  respuesta_correcta: string; explicacion: string;
}

interface QuizParams {
  tema: string;
  duracion: string;
}

type EstadoJuego = 'cargando' | 'mostrando' | 'respondido' | 'finalizado' | 'juego_terminado';

function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

const QuizPage: React.FC = () => {
  const { tema, duracion } = useParams<QuizParams>();
  const history = useHistory();

  // Estados
  const [mazo, setMazo] = useState<Pregunta[]>([]);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [puntaje, setPuntaje] = useState(0); // Asegúrate de tener puntaje y setPuntaje
  const [estadoJuego, setEstadoJuego] = useState<EstadoJuego>('cargando');
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [esCorrecto, setEsCorrecto] = useState<boolean | null>(null);
  const [explicacion, setExplicacion] = useState<string | null>(null);
  const [vidas, setVidas] = useState(5);
  const [xp, setXp] = useState(0);
  const [racha, setRacha] = useState(0);
  const [bonus, setBonus] = useState(false);
  const [opcionesFallidas, setOpcionesFallidas] = useState<string[]>([]);
  const [rachaMaxima, setRachaMaxima] = useState(0);

  const numPreguntas = parseInt(duracion) || 15;
  const preguntaActual = mazo[indicePregunta];

  useEffect(() => {
    const fetchPreguntasPorTema = async () => {
      // ... (lógica fetch sin cambios) ...
      setEstadoJuego('cargando');
      setMazo([]); setIndicePregunta(0); setPuntaje(0); setSeleccion(null);
      setEsCorrecto(null); setExplicacion(null); setVidas(5); setXp(0);
      setOpcionesFallidas([]); setRacha(0); setBonus(false); setRachaMaxima(0);
      try {
        const temaDecodificado = decodeURIComponent(tema);
        const response = await fetch(`http://127.0.0.1:5000/api/preguntas/${temaDecodificado}`);
        if (!response.ok) throw new Error(`No se encontraron preguntas para '${temaDecodificado}'`);
        const data = await response.json();
        const todasLasPreguntas: Pregunta[] = data.preguntas || [];
        if (todasLasPreguntas.length > 0) {
          const preguntasMezcladas = shuffleArray(todasLasPreguntas);
          const mazoLimitado = preguntasMezcladas.slice(0, numPreguntas);
          setMazo(mazoLimitado);
          setEstadoJuego('mostrando');
        } else { history.goBack(); }
      } catch (error) { console.error("Error al cargar preguntas:", error); history.replace('/tabs/tab1'); }
    };
    fetchPreguntasPorTema();
  }, [tema, duracion, history]);

  const guardarProgreso = async (xpGanado: number) => {
    if (xpGanado <= 0) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await fetch('http://127.0.0.1:5000/api/user/update_xp', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ xp_ganado: xpGanado })
      });
    } catch (error) { console.error("Error al guardar el progreso:", error); }
  };

  const handleRespuesta = (opcionSeleccionada: string) => {
     if (!preguntaActual || opcionesFallidas.includes(opcionSeleccionada) || estadoJuego === 'respondido') return;
     const correcta = preguntaActual.respuesta_correcta;
     if (opcionSeleccionada === correcta) {
         const nuevaRacha = racha + 1; setRacha(nuevaRacha);
         if (nuevaRacha > rachaMaxima) setRachaMaxima(nuevaRacha);
         let xpGanado = 10;
         if (nuevaRacha % 5 === 0 && nuevaRacha > 0) { xpGanado += 50; setBonus(true); } else { setBonus(false); }
         setXp(xp + xpGanado); setPuntaje(puntaje + 1); setEsCorrecto(true); // Suma puntaje aquí
         setSeleccion(opcionSeleccionada); setExplicacion(preguntaActual.explicacion);
         setEstadoJuego('respondido');
     } else {
         setEsCorrecto(false); setRacha(0); setBonus(false);
         setOpcionesFallidas([...opcionesFallidas, opcionSeleccionada]);
         const nuevasVidas = vidas - 1; setVidas(nuevasVidas);
         if (nuevasVidas <= 0) { guardarProgreso(xp); setEstadoJuego('juego_terminado'); }
     }
  };

  const handleSiguiente = () => {
     const proximoIndice = indicePregunta + 1;
     if (proximoIndice < mazo.length) {
         setIndicePregunta(proximoIndice); setEstadoJuego('mostrando');
         setSeleccion(null); setEsCorrecto(null); setExplicacion(null);
         setOpcionesFallidas([]); setBonus(false);
     } else {
         guardarProgreso(xp); setEstadoJuego('finalizado');
     }
  };

  const volverAlMenuEjes = () => { history.goBack(); };

  const getBotonColor = (opcion: string): ('success' | 'danger' | 'medium' | undefined) => {
    if (estadoJuego === 'respondido') {
      if (opcion === preguntaActual?.respuesta_correcta) return 'success';
      if (opcionesFallidas.includes(opcion)) return 'danger';
    }
    if (estadoJuego === 'mostrando') {
      if (opcionesFallidas.includes(opcion)) return 'danger';
      return 'medium';
    }
    return 'medium'; // Default return
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{decodeURIComponent(tema)} ({mazo.length} preg.)</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">

        <IonLoading isOpen={estadoJuego === 'cargando'} message={'Cargando preguntas...'} />

        {preguntaActual && (estadoJuego === 'mostrando' || estadoJuego === 'respondido') && (
          <>
            {/* Barra de Vidas/Racha/XP */}
            <div className="ion-text-center ion-margin-bottom">
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 10px' }}>
                <IonText color="danger"><h2 style={{ margin: 0 }}>❤️ {vidas}</h2></IonText>
                <IonText color="warning"><h2 style={{ margin: 0 }}>🔥 {racha}</h2></IonText>
                <IonText color="success"><h2 style={{ margin: 0 }}>{xp} XP</h2></IonText>
              </div>
              <IonText color="medium" style={{ marginTop: '8px' }}>
                <p>Pregunta {indicePregunta + 1} de {mazo.length}</p>
              </IonText>
            </div>
            {/* Tarjeta de Pregunta */}
            <IonCard>
              <IonCardHeader><IonCardTitle>{preguntaActual.tema}</IonCardTitle></IonCardHeader>
              <IonCardContent>{preguntaActual.pregunta}</IonCardContent>
            </IonCard>
            {/* Lista de Opciones */}
            <IonList>
              {preguntaActual.opciones.map((opcion) => (
                <IonItem
                  key={opcion}
                  button
                  onClick={() => handleRespuesta(opcion)}
                  disabled={estadoJuego === 'respondido' || opcionesFallidas.includes(opcion)}
                  color={getBotonColor(opcion)}
                >
                  <IonLabel>{opcion}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </>
        )}

        {/* --- ESTADO RESPONDIDO (DESCOMENTADO) --- */}
        {estadoJuego === 'respondido' && (
          <div className="ion-text-center ion-margin-top">
            <h2 style={{ color: 'var(--ion-color-success)' }}>¡Correcto!</h2>
            {bonus && (<IonText color="success"><h3>¡Bonus de Racha! +50 XP</h3></IonText>)}
            {explicacion && (
              <IonCard color="light" className="ion-margin-top">
                <IonCardHeader><IonCardTitle>Explicación</IonCardTitle></IonCardHeader>
                <IonCardContent className="ion-text-left">{explicacion}</IonCardContent>
              </IonCard>
            )}
            <IonButton expand="block" onClick={handleSiguiente} className="ion-margin-top">Siguiente</IonButton>
          </div>
        )}

        {/* --- ESTADO FINALIZADO (DESCOMENTADO) --- */}
        {estadoJuego === 'finalizado' && (
          <div className="ion-text-center ion-margin-top">
            <h2>¡Práctica Completada! 🏆</h2>
            <IonText color="primary"><h3>Puntaje Final: {puntaje} de {mazo.length}</h3></IonText>
            <IonText color="success"><h3>XP Obtenido: {xp}</h3></IonText>
            <IonText color="warning"><h3>Racha Máxima: {rachaMaxima}</h3></IonText>
            <IonButton expand="block" onClick={volverAlMenuEjes}>Volver a Ejes</IonButton>
          </div>
        )}

        {/* --- ESTADO JUEGO TERMINADO (DESCOMENTADO) --- */}
        {estadoJuego === 'juego_terminado' && (
          <div className="ion-text-center ion-margin-top">
            <h1 style={{ fontSize: '3rem' }}>💔</h1>
            <h2>¡Te quedaste sin vidas!</h2>
            <IonText color="primary"><h3>Puntaje Final: {puntaje} de {mazo.length}</h3></IonText>
            <IonText color="success"><h3>XP Obtenido: {xp}</h3></IonText>
            <IonText color="warning"><h3>Racha Máxima: {rachaMaxima}</h3></IonText>
            <IonButton expand="block" onClick={volverAlMenuEjes} className="ion-margin-top">Volver a Ejes</IonButton>
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

// Quitamos las re-exportaciones de funciones si están definidas dentro como arriba

export default QuizPage;