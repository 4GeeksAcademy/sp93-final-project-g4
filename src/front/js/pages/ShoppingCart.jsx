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
                        <div className="">
                            {
                                store.showCart.bookings !== undefined ? (
                                    store.showCart.bookings.map((cartProduct) => (
                                        <div key={cartProduct.bookings_id}>
                                            <div className="card-body">
                                                <div className="d-flex justify-content-around">
                                                    <div className="me-5">
                                                        <h5 className="card-title">{cartProduct.movie_title}</h5>
                                                        <p className="card-text mt-4">CINEMA CENTER</p>
                                                        <p className="card-text">{cartProduct.cinema_room_name} - {cartProduct.showtime_date}</p>
                                                    </div>
                                                    <div className="me-5 ms-2">
                                                        <div className="d-flex justify-content-between">
                                                            <p className="card-text">Price € {cartProduct.booking_price}</p>
                                                            <button type="button" className="btn-close text-bg-secondary ms-5" aria-label="Close"></button>
                                                        </div>
                                                        
                                                        <p className="card-text">Subtotal Products</p>
                                                        <p className="card-text">€ {cartProduct.booking_price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-secondary">{store.showCart.message}</span>
                                )
                            }
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
                        {
                            store.showCart.products !== undefined ? (
                                store.showCart.products.map((cartProduct) => (
                                    <div key={cartProduct.product_id}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-around">
                                                <div className="me-5">
                                                    <h5 className="card-title">CINEMA COMBO</h5>
                                                    <p className="card-text mt-4">{cartProduct.name}</p>
                                                </div>
                                                <div className="me-5 ms-2">
                                                    <div className="d-flex justify-content-between">
                                                        <p className="card-text">Price € {cartProduct.unit_price}</p>
                                                        <button type="button" className="btn-close text-bg-secondary ms-5" aria-label="Close"></button>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <i type="button" className="fa-solid fa-circle-plus h3"></i>
                                                        <div>{cartProduct.quantity}</div>
                                                        <i type="button" className="fa-solid fa-circle-minus h3"></i>
                                                    </div>
                                                    <p className="card-text">Subtotal Products</p>
                                                    <p className="card-text">€ {cartProduct.unit_price}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                    </div>
                                ))
                            ) : (
                                <span className="text-secondary">{store.showCart.message}</span>
                            )
                        }
                    </div>
                    <hr />
                </div>
            </div>
        </div>
    )
}