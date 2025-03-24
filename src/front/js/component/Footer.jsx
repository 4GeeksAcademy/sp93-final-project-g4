import React from "react";


export const Footer = () => (
	<footer className="d-flex flex-wrap mt-auto justify-content-between align-items-center py-3 border-top">
		<p className="col-md-4 mb-0 text-body-secondary">© 2025 Cinema Center, Inc</p>

		<a href="/" className="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
			<svg className="bi me-2" width="40" height="32"></svg>
		</a>

		<ul className="nav col-md-4 justify-content-end">
			<li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">Home</a></li>
			<li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">Features</a></li>
			<li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">Pricing</a></li>
			<li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">FAQs</a></li>
			<li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">About</a></li>
		</ul>
	</footer>
);
