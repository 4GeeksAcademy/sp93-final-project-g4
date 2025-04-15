import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "./../../styles/register.css"

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

        const newUser = { username: name, email, password };

        actions.register(newUser)
        navigate("/")
    }


    return (
        <div className="register-container d-flex align-items-center justify-content-center vh-100">
            <form className="shadow-lg rounded-4 p-4 mt-4" onSubmit={handleRegister} style={{ width: "350px" }}>
                <h2 className="text-center mb-4">Create your account</h2>

                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full name</label>
                    <input
                        type="text"
                        id="name"
                        className="form-control"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="name@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className="form-control"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">Register</button>
                <div className="mt-2 text-center">
                    <span>Already have an account? <a href="/login" className="text-info">Login</a></span>
                </div>
            </form>
        </div>
    )
}
