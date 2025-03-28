import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "./../../styles/index.css"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';


export const Navbar = () => {

	const { store, actions } = useContext(Context);
	const navigate = useNavigate()
	const user = store.user || {};
	const [show, setShow] = useState(false);
	const [icon, setIcon] = useState("none")
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const [form, setForm] = useState({
		"userName": user.username,
		"email": user.email
	})
	const handleAccess = () => {
		if (store.isLogged) {
			actions.logout();
		} else {
			navigate('/login');
		}
	}


	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm({ ...form, [name]: username == "" || email == "" ? event.target.checked : value })
	}

	const handleEditSubmit = (event) => {
			/* event.preventDefault();
			actions.editProfile(form)
			/* setShow(false) 
			navigate("/") */}

	const handleLogOut = () => {
		actions.logout()
	}
	return (
		<nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
			<div className="container-fluid">
				<Link className="navbar-brand" to="/">Navbar</Link>
				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarColor02">
					<ul className="navbar-nav me-auto">
						{/* <li className="nav-item">
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
							</li>*/}
					</ul>
					<div>
						{store.isLogged ? (
							<>

								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-person-vcard me-4" viewBox="0 0 16 16" style={{ cursor: "pointer" }} onClick={handleLogOut}>
									<path d="M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4m4-2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5M9 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 9 8m1 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5" />
									<path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8.96q.04-.245.04-.5C9 10.567 7.21 9 5 9c-2.086 0-3.8 1.398-3.984 3.181A1 1 0 0 1 1 12z" />
									<ul className="dropdown-menu dropdown-menu-end">
										<i className="fa-regular fa-user-gear " />
										<li className="dropdown-item">{user.username}</li>
										<li className="dropdown-item">{user.email}</li>
										<li className="dropdown-item">Wallet: {user.wallet}</li>
										<li className="dropdown-item">Points: {user.points}</li>
										<li><hr className="dropdown-divider" /></li>
										<button onClick={handleAccess} type="button" className="btn btn-danger m-2 rounded-4">Log out</button>
										<Button variant="primary rounded-4" onClick={handleShow}><i className='fa fa-pencil' /></Button>
									</ul>
								</svg>
							</>
						) : (
							<>
								<svg className="me-4" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512" style={{ cursor: "pointer" }} onClick={() => navigate("/login")} >
									<path fill="#7a7a7a" d="M352 96l64 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0c53 0 96-43 96-96l0-256c0-53-43-96-96-96l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32zm-9.4 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L242.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
								</svg>
							</>
						)}
						<ul className=" dropdown-menu dropdown-menu-end">

							<>
								<li className="dropdown-item">{user.username}</li>
								<li className="dropdown-item">{user.email}</li>
								<li className="dropdown-item">Wallet: {user.wallet}</li>
								<li className="dropdown-item">Points: {user.points}</li>
								<li><hr className="dropdown-divider" /></li>
								<button onClick={handleAccess} type="button" className="btn btn-danger m-2 rounded-4">Log out</button>
								<Button variant="primary rounded-4" onClick={handleShow}><i className='fa fa-pencil' /></Button>
							</>

							<>
								<Link /* onClick={handleAccess} */ className="btn btn-primary m-2 rounded-4" to="/login">Login</Link>
								{/* <div className="d-flex justify-content-center">
										{/* <Link to="/register" className="btn btn-secondary m-2 rounded-4">Register</Link> 
									</div> */}
							</>

						</ul>
					</div>
				</div>
				<Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
					<Modal.Header closeButton>
						<Modal.Title>Edit Your Profile</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form.Floating onSubmit={handleEditSubmit} className="mb-3">
							<Form.Control onChange={handleChange} id="floatingInputCustom" type="text" placeholder="your Name here" /* value={form.userName} */ />
							<label htmlFor="floatingInputCustom">Change Name</label>
						</Form.Floating>
						<Form.Floating className="mb-3">
							<Form.Control onChange={handleChange} id="floatingInputCustom" type="email" placeholder="name@example.com" /* value={form.email} */ />
							<label htmlFor="floatingInputCustom">Change Email address</label>
						</Form.Floating>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleClose}>Cancel</Button>
						<Button variant="primary" type="submit">Done</Button>
					</Modal.Footer>
				</Modal>

			</div>
		</nav >
	);
};
