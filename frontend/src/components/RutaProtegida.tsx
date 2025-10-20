import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

interface RutaProtegidaProps extends RouteProps {
  component: React.ComponentType<any>;
}

const RutaProtegida: React.FC<RutaProtegidaProps> = ({ component: Component, ...rest }) => {

  const estaAutenticado = () => {
    return localStorage.getItem('access_token') !== null;
  };

  return (
    <Route
      {...rest}
      render={props =>
        estaAutenticado() ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
};

export default RutaProtegida;