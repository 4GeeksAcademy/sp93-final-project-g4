import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";


export const Navbar = () => {

	const { store, actions } = useContext(Context);
	const navigate = useNavigate()

	const handleAccess = () => {
		if (store.isLogged) {
			// actions.logout();
		} else {
			navigate('/login');
		}

		navigate('/login')
	}

	return (
		<nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
			<div className="container-fluid">
				<a className="navbar-brand" href="#">Navbar</a>
				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarColor02">
					<ul className="navbar-nav me-auto">
						<li className="nav-item">
							<a className="nav-link active" href="#">Home
								<span className="visually-hidden">(current)</span>
							</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="#">Features</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="#">Pricing</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="#">About</a>
						</li>
						<li className="nav-item dropdown">
							<a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>
							<div className="dropdown-menu">
								<a className="dropdown-item" href="#">Action</a>
								<a className="dropdown-item" href="#">Another action</a>
								<a className="dropdown-item" href="#">Something else here</a>
								<div className="dropdown-divider"></div>
								<a className="dropdown-item" href="#">Separated link</a>
							</div>
						</li>
					</ul>
					<div className="me-4">
						<button onClick={handleAccess} type="button" className="btn btn-primary me-2 rounded-4">{store.isLogged ? 'Log out' : 'Login'}</button>
						<button to="/register" className="btn btn-secondary rounded-4">Register</button>
					</div>
				</div>
			</div>
		</nav>
	);
};
