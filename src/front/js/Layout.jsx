import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import injectContext from "./store/appContext.js";
// Custom components
import { BackendURL } from "./component/BackendURL.jsx";
import ScrollToTop from "./component/ScrollToTop.jsx";
import { Footer } from "./component/Footer.jsx";
import { Navbar } from "./component/Navbar.jsx";
import { Alert } from "./component/Alert.jsx";
import { ProtectedRoute } from "./component/ProtectedRoute.jsx";
// Custom Pages or Views
import { Home } from "./pages/Home.jsx";
import { Error404 } from "./pages/Error404.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { BookingSesion } from "./pages/BookingSesion.jsx";
import { MoviesDetails } from "./pages/MoviesDetails.jsx";
import { Shop } from "./pages/Shop.jsx";
import { ShoppingCart } from "./pages/ShoppingCart.jsx";



//Create your first component
const Layout = () => {
    // The basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";
    if (!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL />;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Alert />
                    <Routes>
                        <Route element={<Home />} path="/" />
                        <Route element={<Login />} path="/login" />
                        <Route element={<Register />} path="/register" />
                        <Route element={<BookingSesion />} path="/booking-sesion/:id" />
                        <Route element={<MoviesDetails />} path="/movies-details/:movieId" />
                        <Route element={<Shop />} path="/snack-bar" />
                        {/* <Route element={
                            <ProtectedRoute>
                                <Shop />
                            </ProtectedRoute>
                        } path="/snack-bar" /> */}
                        <Route element={
                            <ProtectedRoute>
                                <ShoppingCart />
                            </ProtectedRoute>
                        } path="/shopping-cart" />
                        <Route element={<Error404 />} path='*' />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
