import { Navigate } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { Context } from '../store/appContext';

export const ProtectedRoute = ({ children }) => {
  const { store, actions } = useContext(Context);

  // useEffect(() => {
  //       actions.isUserLogged();
  //     }, []);

  // if (store.isLoadingUser)
  //   console.log('cargando');

  return store.isLogged ? children : <Navigate to="/login" />;
};
