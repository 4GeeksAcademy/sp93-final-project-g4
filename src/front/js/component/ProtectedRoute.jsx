import { Navigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { Context } from '../store/appContext'; // Ajusta la ruta si es diferente

export const ProtectedRoute = ({ children }) => {
  const { store } = useContext(Context);

  return store.isLogged ? children : <Navigate to="/login" />;
};
