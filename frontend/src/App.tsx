import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1'; // Menú Principal
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3'; // Perfil

/* Core CSS */
import '@ionic/react/css/core.css';
/* Basic CSS */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS */
import '@ionic/react/css/padding.css';
// ...

/** Dark Mode */
import '@ionic/react/css/palettes/dark.always.css';

/* Theme variables */
import './theme/variables.css';

// Import Pages
import Login from './pages/Login';
import Registro from './pages/Registro';
import TemaMenu from './pages/TemaMenu';
import QuizPage from './pages/QuizPage'; // Importamos QuizPage

// Import Components
import RutaProtegida from './components/RutaProtegida';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Rutas Públicas */}
        <Route exact path="/login" component={Login} />
        <Route exact path="/registro" component={Registro} />

        {/* Rutas Protegidas */}
        <RutaProtegida exact path="/menu/:materia" component={TemaMenu} />

        {/* --- RUTA QUIZ ACTUALIZADA --- */}
        {/* Ahora acepta '/:tema' y '/:duracion' */}
        <RutaProtegida exact path="/quiz/:tema/:duracion" component={QuizPage} />

        {/* Ruta principal de Tabs */}
        <RutaProtegida path="/tabs" component={TabsComponent} />

        {/* Redirección */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

// Tabs Component (sin cambios)
const TabsComponent: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/tabs/tab1"><Tab1 /></Route>
      <Route exact path="/tabs/tab2"><Tab2 /></Route>
      <Route exact path="/tabs/tab3"><Tab3 /></Route>
      <Route exact path="/tabs"><Redirect to="/tabs/tab1" /></Route>
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="tab1" href="/tabs/tab1"><IonIcon icon={triangle} /><IonLabel>Práctica</IonLabel></IonTabButton>
      <IonTabButton tab="tab2" href="/tabs/tab2"><IonIcon icon={ellipse} /><IonLabel>Tab 2</IonLabel></IonTabButton>
      <IonTabButton tab="tab3" href="/tabs/tab3"><IonIcon icon={square} /><IonLabel>Perfil</IonLabel></IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default App;