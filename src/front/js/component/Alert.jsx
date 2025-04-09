import React, { useContext } from "react";
import { Context } from "../store/appContext.js";


export const Alert = () => {
  const { store } = useContext(Context);

  return (
    <div
      className={`alert alert-${store.alert.background} custom-alert ${store.alert.visible ? "show" : "hide"}`}
      role="alert"
    >
      {store.alert.text}
    </div>
  )
}