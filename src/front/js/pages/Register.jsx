import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "./../../styles/register.css"
import Carousel from 'react-bootstrap/Carousel';

export const Register = () => {

    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            return
        }

        const newUser = { name, email, password };

        actions.register(newUser)
        // .then(() => {
        //     navigate("/home")
        // })
        // .catch(error => {
        //     console.error("error registering: ", error)
        // });
        navigate("/")
    }


    return (
        <div>
            <div className="d-flex aling-items-center justify-content-center mt-3">
                <form className=" shadow-lg rounded-4" onSubmit={handleRegister} style={{zIndex: 2}}>
                    <h2 className="text-center mb-4">Create your account</h2>

                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Full name</label>
                        <input
                            type="text"
                            id="name"
                            className="form-control"
                            placeholder="name"
                            value={name} onChange={(e) => setName(e.target.value)}
                            required
                        ></input>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="name@gmail.com"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            required
                        ></input>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            required
                        ></input>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-control"
                            placeholder="••••••••"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        ></input>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Register</button>
                    <span className="">Already have an account? <a href="/login" className="text-info">Login</a></span>
                </form>
                <Carousel className="register-carousel" fade style={{ height: '100vh' }}>
                    {
                        store.movieList.map((movie) => (
                            <Carousel.Item key={movie.id} interval={2800}>
                                <img
                                    src={`https://media.themoviedb.org/t/p/w1066_and_h600_bestv2${movie.backdrop_path}`}
                                    className="register-carousel"
                                    alt={movie.title} // Usando el título de la película como texto alternativo
                                    
                                />
                            </Carousel.Item>
                        ))
                    }
                </Carousel>
            </div>
        </div>
    )
}
