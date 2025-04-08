import React, { use, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext.js";
import "./../../styles/index.css"

export const ShoppingCart = () => {
    const { store, actions } = useContext(Context)


    return (
        <div>
            <h1 className="text-center">My Order</h1>
            <hr />
            <div className=" mb-3" >
                <div className="row g-0">
                    <div className="col">
                        <img src="https://res.cloudinary.com/odeoncloud//w_320%2Cf_auto%2Cq_70/v1742841543/wcloud/odeon/fr_11326.png" className="img-fluid rounded-start" alt="..." style={{ width: '18rem', height: 'auto' }} bg="light" text="dark" />
                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            <div className="d-flex justify-content-around">
                                <div>
                                    <h5 className="card-title">WORKING MAN</h5>
                                    <p className="card-text mt-3">CINEMA CENTER</p>
                                    <p className="card-text">Cinema-room 01 - 21:00hs</p>
                                    <p className="card-text">Row 02 - Seat 04</p>
                                </div>
                                <div className="me-5">
                                    <div className="d-flex justify-content-between">
                                        <p className="card-text">Price € 8</p>
                                        <button type="button" className="btn-close text-bg-secondary ms-5" aria-label="Close"></button>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <i type="button" className="fa-solid fa-circle-plus h3"></i>
                                        <div>1</div>
                                        <i type="button" className="fa-solid fa-circle-minus h3"></i>
                                    </div>
                                    <p className="card-text">Subtotal Products</p>
                                    <p className="card-text">€ 8</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <div className="mb-3">
                <div className="row g-0">
                    <div className="col">
                        <img src='https://i.postimg.cc/mr9PQzBj/CINEMA-CENTER-logo-Final-removebg-preview.png' className="img-fluid rounded-start" alt="..." style={{ width: '18rem', height: '250px' }} bg="light" text="dark" />
                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            <div className="d-flex justify-content-around">
                                <div className="me-5">
                                    <h5 className="card-title">CINEMA COMBO</h5>
                                    <p className="card-text mt-4">Combo Description</p>
                                </div>
                                <div className="me-5 ms-2">
                                    <div className="d-flex justify-content-between">
                                        <p className="card-text">Price € 9.5</p>
                                        <button type="button" className="btn-close text-bg-secondary ms-5" aria-label="Close"></button>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <i type="button" className="fa-solid fa-circle-plus h3"></i>
                                        <div>1</div>
                                        <i type="button" className="fa-solid fa-circle-minus h3"></i>
                                    </div>
                                    <p className="card-text">Subtotal Products</p>
                                    <p className="card-text">€ 9.5</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            {
                store.showCart.products !== undefined ? (
                    store.showCart.products.map((c) => (
                        <div key={c.product_id}>
                            <p className="text-center fw-bold">{c.name}</p>
                            <div className="d-flex justify-content-around" style={{ marginTop: '-10px' }}>
                                <span>{c.quantity}x</span>
                                <span>+{c.unit_price} €</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <span className="text-secondary">{store.showCart.message}</span>
                )
            }
        </div>
    )

}