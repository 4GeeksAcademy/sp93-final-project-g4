import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "./../../styles/login.css"
import Carousel from 'react-bootstrap/Carousel';

export const Login = () => {
    const { store, actions } = useContext(Context);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [viewPassword, setViewPassword] = useState(false)
    const navigate = useNavigate()
    const handleViewPassword = () => { setViewPassword(!viewPassword) }
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
                    <h2 className="text-center mb-4">Wellcome</h2>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="form-control" id="email" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div class="input-group">
                            
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type={viewPassword ? "text" : "password"} className="form-control " id="password" required />
                            <span className="input-group-text text-bg-light" onClick={handleViewPassword}>
                                {viewPassword ?
                                    <i className="fa fa-eye-slash"></i>
                                    :
                                    <i className="fa fa-eye"></i>
                                }
                            </span>
                        </div>
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
