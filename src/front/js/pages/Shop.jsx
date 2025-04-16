import React, { useContext, useState } from "react";
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import popCorn from '../../img/palomitas.jpg';
import { Context } from "../store/appContext";
import { Login } from "./Login.jsx";


export const Shop = () => {

    const { store, actions } = useContext(Context)
    // const [productQuantities, setProductQuantities] = useState({});

    // const handleChangeQuantity = (productId, change) => {
    //     setProductQuantities({
    //         ...productQuantities,
    //         [productId]: Math.max((productQuantities[productId] || 0) + change, 0),
    //     });
    // };
    const navigate = useNavigate();
    const handleAddToCart = (productId) => {
        // const quantity = productQuantities[productId];
        const purchasedProduct = {
            product_id: productId,
            // quantity: quantity,
        };
        actions.addCart(purchasedProduct);
    };

    const handleCheckout = () => {
        navigate('/shopping-cart')
    }

    return !store.isLogged ? <Login /> : (
        
        <div className="container">
            <h1 className="mt-5">Snack Bar</h1>
            <hr />
            <h3 className="text-light mt-5">Do you want something?</h3>
            <p>Here's our best selection of products to make your movie taste better... <br />
                Take advantage of exclusive offers</p>

            <div className="d-flex">
                <Card style={{ width: '40rem' }}>
                    <Card.Img variant="top" src={popCorn} />
                    <Card.Body>
                        <Card.Title>Combos</Card.Title>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        {
                            store.productList.map((p) => (

                                <ListGroup.Item key={p.id}>
                                    <div className="d-flex justify-content-between">
                                        <div className="w-75">
                                            <p className="pt-3">{p.name} <Badge bg="light">{p.base_price}</Badge></p>
                                            <p style={{ color: "#bbbaba" }}>{p.description}</p>
                                        </div>

                                        <div className="mt-4">
                                            <button type="button" className="btn btn-warning" onClick={() => handleAddToCart(p.id)}>Add to cart</button>

                                            {/* <svg style={{cursor: 'pointer'}} onClick={() => handleChangeQuantity(p.id, -1)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-dash-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a 7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                                            </svg>
                                            <span style={{ margin: "10px" }}> {productQuantities[p.id] || 0}</span>
                                            <svg style={{cursor: 'pointer'}} onClick={() => handleChangeQuantity(p.id, 1)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                            </svg> */}
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))
                        }
                    </ListGroup>
                </Card>

                <Card style={{ width: '18rem', marginLeft: '150px', height: 'auto' }} bg="light" text="dark">
                    {store.showCart.bookings?.length > 0 && (
                        <>
                            <Card.Img
                                variant="top"
                                src={`https://image.tmdb.org/t/p/original${store.showCart.bookings[0].movie_image}`}
                            />
                            <Card.Body style={{ height: 'auto' }}>
                                <Card.Title>{store.showCart.bookings[0].movie_title}</Card.Title>
                                <div>
                                    <p className="fw-bold">Date: {store.showCart.bookings[0].showtime_date}</p>
                                    <p className="fw-bold">Hour: {store.showCart.bookings[0].showtime_hour}</p>
                                </div>

                                <p>Tickets</p>
                                <hr />
                                <div className="container text-center text-secondary">
                                    <div className="row align-items-center">
                                        <div className="col">Theater</div>
                                        <div className="col">Row</div>
                                        <div className="col">Col</div>
                                    </div>
                                </div>

                                <div className="container text-center fw-bold pt-1">
                                    {store.showCart.bookings.map((b) => (
                                        <div key={b.booking_id} className="row align-items-center">
                                            <div className="col">{b.cinema_room_name}</div>
                                            <div className="col">{b.row_reserved}</div>
                                            <div className="col">{b.col_reserved}</div>
                                        </div>
                                    ))}
                                </div>

                                <p className="pt-4">Snack</p>
                                <hr />
                                {store.showCart.products?.length > 0 ? (
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
                                    <span className="text-secondary">{store.showCart.message || "No snacks selected."}</span>
                                )}

                                <button type="button" className="btn btn-danger mt-5" onClick={handleCheckout}>Checkout</button>
                                
                            </Card.Body>
                        </>
                    )}
                </Card>

            </div>
        </div>
    )
}