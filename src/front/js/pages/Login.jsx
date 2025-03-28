import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "./../../styles/login.css"
import Carousel from 'react-bootstrap/Carousel';

export const Login = () => {
    const { store, actions } = useContext(Context);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate()

    const handleLogin = (event) => {
        event.preventDefault();
        const userLogin = {
            email,
            password
        };
        actions.login(userLogin);
        navigate('/')
    };

    return (
        <div id="login" style={{ position: 'relative', height: '100vh' }}>
            <div className="d-flex align-items-center justify-content-center">
                <form className=" shadow-lg rounded-4 p-4 w-25" onSubmit={handleLogin}>
                    <h3 className="text-center mb-4">Wellcome!</h3>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="name@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                    <span className="">Don't have an account? <a href="/register" className="text-info">Register</a></span>
                </form>
                <div>
                    <Carousel className="mt-3 login-carousel" fade>
                        {
                            store.movieList.map((movie) => (
                                <Carousel.Item key={movie.id} interval={2800} >
                                    <img
                                        src={`https://media.themoviedb.org/t/p/w1066_and_h600_bestv2${movie.backdrop_path}`}
                                        className="d-block mx-auto login-carousel"
                                        alt={movie.title} // Usando el título de la película como texto alternativo

                                    />
                                </Carousel.Item>
                            ))
                        }
                    </Carousel>

                </div>
            </div>
        </div>
    )
}