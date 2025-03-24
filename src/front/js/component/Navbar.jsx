import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";


export const Navbar = () => {

	const { store, actions } = useContext(Context);
	const navigate = useNavigate()

	const handleAccess = () => {
		if (store.isLogged) {
			actions.logout();
		} else {
			navigate('/login');
		}
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
					<div className="me-4 dropdown">
						<svg xmlns="http://www.w3.org/2000/svg" style={{ cursor: "pointer" }} width="30" height="30" fill="currentColor" className="bi bi-person-fill dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" viewBox="0 0 16 16">
							<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
						</svg>
						<ul className="dropdown-menu dropdown-menu-end">
							{store.isLogged ? (
								<>
									<li><a className="dropdown-item" href="#">Action</a></li>
									<li><a className="dropdown-item" href="#">Another action</a></li>
									<li><a className="dropdown-item" href="#">Something else here</a></li>
									<li><hr className="dropdown-divider" /></li>
									<button onClick={handleAccess} type="button" className="btn btn-danger m-2 rounded-4">Log out</button>
								</>
							) : (
								<>
									<div className="d-flex">
										<button onClick={handleAccess} type="button" className="btn btn-primary m-2 rounded-4">Login</button>
										<Link to="/register" className="btn btn-secondary m-2 rounded-4">Register</Link>
									</div>
								</>
							)}
						</ul>
					</div>
				</div>
			</div>
		</nav>
	);
};
