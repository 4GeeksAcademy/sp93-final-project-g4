import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

export const Login = () => {

    const { actions } = useContext(Context);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate()

    const handleLogin  = () => {    
        event.preventDefault();    
        const userLogin = {
            email,
            password
        };
        actions.login(userLogin);
        navigate('/')
    };

    return (

        <div className="d-flex align-items-center justify-content-center min-vh-100">
            <form className="bg-white shadow-lg rounded-4 p-4 w-25" onSubmit={handleLogin}>
                <h2 className="text-center mb-4">Sign in to your account</h2>

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
                <span className="">You don't have an account? <a href="/register" className="text-info">Register</a></span>
            </form>
        </div>
    )
}