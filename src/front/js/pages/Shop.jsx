import React from "react";
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import popCorn from '../../img/palomitas.jpg';


export const Shop = () => {
    return (
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
                        <ListGroup.Item>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="pt-3">Menu Cine <Badge bg="light">6.50€</Badge></p>
                                    <p style={{ color: "#bbbaba" }}>Palomitas (225 gr) + Refresco (75cl)</p>
                                </div>

                                <div className="mt-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-dash-circle" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                                    </svg>
                                    <span style={{ margin: "10px" }}>2</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                    </svg>
                                </div>
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="pt-3">Menu Duo <Badge bg="light">9.20€</Badge></p>
                                    <p style={{ color: "#bbbaba" }}>Palomitas (355 gr) + 2 Refresco (100cl)</p>
                                </div>

                                <div className="mt-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-dash-circle" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                                    </svg>
                                    <span style={{ margin: "10px" }}>2</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                    </svg>
                                </div>
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="pt-3">Menu Infantil <Badge bg="light">4.90€</Badge></p>
                                    <p style={{ color: "#bbbaba" }}>Palomitas (90 gr) + bebida pequeña (40cl)</p>
                                </div>

                                <div className="mt-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-dash-circle" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                                    </svg>
                                    <span style={{ margin: "10px" }}>2</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                    </svg>
                                </div>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>

                <Card style={{ width: '18rem', 'margin-left': "150px", height: "auto" }} bg="light" text="dark">
                    <Card.Img variant="top" src="https://res.cloudinary.com/odeoncloud//w_320%2Cf_auto%2Cq_70/v1742841543/wcloud/odeon/fr_11326.png" />
                    <Card.Body style={{ height: "auto" }}>
                        <Card.Title>A WORKING MAN</Card.Title>
                        <Card.Text>
                            <p className="fw-bold">Date: Miercoles 2 de abril</p>
                            <p className="fw-bold">Hour: 17:50</p>

                            <p>Tickets</p>
                            <hr />
                            <div class="container text-center text-secondary">
                                <div class="row align-items-center">
                                    <div class="col">
                                        Theater
                                    </div>
                                    <div class="col">
                                        Row
                                    </div>
                                    <div class="col">
                                        Col
                                    </div>
                                </div>
                            </div>
                            <div class="container text-center fw-bold pt-1">
                                <div class="row align-items-center">
                                    <div class="col">
                                        3
                                    </div>
                                    <div class="col">
                                        4
                                    </div>
                                    <div class="col">
                                        6
                                    </div>
                                </div>
                            </div>
                            <p className="pt-4">Snack</p>
                            <hr />
                            <div>
                                <p className="ms-5 fw-bold">Menú Cine</p>
                                <div className="d-flex justify-content-around" style={{'margin-top': "-10px"}}>
                                    <span>2x</span>
                                    <span>+6,50 €</span>
                                </div>
                                <p className="fw-bold pt-2 ms-5">Menú Duo</p>
                                <div className="d-flex justify-content-around" style={{'margin-top': "-10px"}}>
                                    <span>2x</span>
                                    <span>+9,20 €</span>
                                </div>
                            </div>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        </div>
    )
}