import React, { use, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "./../../styles/index.css"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Dropdown from "react-bootstrap/Dropdown";


export const Navbar = () => {

	const { store, actions } = useContext(Context);
	const navigate = useNavigate()
	const user = store.user;
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const [username, setName] = useState("")
	const [email, setEmail] = useState("")

	const handleEditSubmit = () => {
		event.preventDefault();
		const updateProfile = {
			id: store.user.id,
			email: email.trim() !== "" ? email : store.user.email,
			username: username.trim() !== "" ? username : store.user.username
		}
		actions.editProfile(updateProfile)
		setShow(false)
	}

	const handleLogOut = () => {
		actions.logout();
		navigate("/login")
	}

	const handleCart = () => {
		navigate("/shopping-cart")
	}

	return (
		<nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
			<div className="container-fluid">
				<Link to="/">
					<span>
						<img src='https://i.postimg.cc/mr9PQzBj/CINEMA-CENTER-logo-Final-removebg-preview.png' border='0' height="75" />
					</span>
				</Link>
				<Link className="nav-link" to="/history">History</Link>
				{/* <ul className="navbar-nav me-auto">
					<li className="nav-item">
						<Link className="nav-link active" to="#">Home
							<span className="visually-hidden">(current)</span>
						</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="#">Features</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="#">Pricing</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="#">About</Link>
					</li> 
					<li className="nav-item dropdown">
						<Link className="nav-link dropdown-toggle" data-bs-toggle="dropdown" to="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</Link>
						<div className="dropdown-menu">
							<Link className="dropdown-item" to="#">Action</Link>
							<Link className="dropdown-item" to="#">Another action</Link>
							<Link className="dropdown-item" to="#">Something else here</Link>
							<div className="dropdown-divider"></div>
							<Link className="dropdown-item" to="#">Separated link</Link>
						</div>
					</li>
				</ul> */}
				<div>
					{store.isLogged ? (
						<div className="d-flex">
							<Dropdown >
								<Dropdown.Toggle className="btn-dark border-0 me-1" id="dropdown-basic">
									<i className="fa-regular fa-address-card"></i>
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<div>
										<span className="p-2">	Username: {user.username} </span>
									</div>
									<div>
										<span className="p-2">	Email: 
											<span>
												{user.email}
											</span>
										</span>
									</div>
									<div>
										<span className="p-2">	Points: {user.points} </span>
									</div>
									<Dropdown.Divider />
									<Dropdown.Item onClick={handleShow} className="text-black p-2"> Edit Profile </Dropdown.Item>
									<Dropdown.Item onClick={handleLogOut} className="text-danger p-2"> Logout </Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
							<Dropdown >
								<Dropdown.Toggle className="btn-dark border-0" id="dropdown-basic">
									<i className="fa-solid fa-cart-shopping"></i>
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<div>
										<span>	Username: {user.username} </span>
									</div>
									<Dropdown.Divider />
									{/* <Dropdown.Item onClick={handleShow} className="text-black"> Edit Profile </Dropdown.Item> */}
									<Dropdown.Item onClick={handleCart} className="text-succes"> GO! </Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</div>
					) : (
						<svg className="me-4" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512" style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
							<path fill="#7a7a7a" d="M352 96l64 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0c53 0 96-43 96-96l0-256c0-53-43-96-96-96l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32zm-9.4 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L242.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
						</svg>
					)}
				</div>
				<Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
					<Modal.Header closeButton>
						<Modal.Title>Edit Your Profile</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form.Floating onSubmit={handleEditSubmit} className="mb-3">
							<Form.Control onChange={(e) => { setName(e.target.value) }} id="floatingInputCustom" type="text" placeholder="your Name here" value={username} />
							<label htmlFor="floatingInputCustom">Your name here</label>
						</Form.Floating>
						<Form.Floating className="mb-3">
							<Form.Control onChange={(e) => { setEmail(e.target.value) }} id="floatingInputCustom" type="email" placeholder="name@example.com" value={email} />
							<label htmlFor="floatingInputCustom">Your email here</label>
						</Form.Floating>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleClose}>Cancel</Button>
						<Button variant="primary" type="submit" onClick={handleEditSubmit}>Done</Button>
					</Modal.Footer>
				</Modal>
			</div>
		</nav >
	);
};
