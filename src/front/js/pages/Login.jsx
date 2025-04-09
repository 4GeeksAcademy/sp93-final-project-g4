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
        <div className="login-container d-flex align-items-center justify-content-center vh-100">
            <form className="shadow-lg rounded-4 p-4" onSubmit={handleLogin} style={{ width: "350px" }}>
                <h2 className="text-center mb-4">Welcome</h2>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                        <input 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            type={viewPassword ? "text" : "password"} 
                            className="form-control" 
                            id="password" 
                            required 
                        />
                        <span className="input-group-text text-bg-light" onClick={handleViewPassword} style={{ cursor: "pointer" }}>
                            {viewPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}
                        </span>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
                <div className="mt-2 text-center">
                    <span>Don't have an account? <a href="/register" className="text-info">Register</a></span>
                </div>
            </form>
        </div>
    )
}
