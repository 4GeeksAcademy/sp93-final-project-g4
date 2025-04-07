import React, { use, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext.js";
import "./../../styles/index.css"

export const ShoppingCart = () => {
    const {store, actions} = useContext(Context)

    return (
        <div>
            <h1>MI PEDIDO</h1>
            <div className="card mb-3" /* style="max-width: 540px;" */>
                <div className="row g-0">
                    <div className="col-md-4">
                        <img src={`https://image.tmdb.org/t/p/w500${store.movie.poster_path}`} className="img-fluid rounded-start" alt={store.movie.title}/>
                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            <h5 className="card-title">{store.movie.title}</h5>
                            <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                            
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <div className="card mb-3" /* style="max-width: 540px;" */>
                <div className="row g-0">
                    <div className="col-md-4">
                        <img src="..." className="img-fluid rounded-start" alt="..."/>
                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            <h5 className="card-title">Your Combo</h5>
                            <p className="card-text">Descripcion del Combo</p>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )







}