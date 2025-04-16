import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext.js";
import { useNavigate, useLocation } from "react-router-dom";




export const PaymentPage = () => {
    const { store, actions} = useContext(Context);
    const navigate = useNavigate();
    const [params, setParams] = useState({});

    const location = useLocation();       // esta función sirve para extraer directamente del cuerpo ('URL') del componente, los datos que necesito

    useEffect(() => {        // este useEffect no va en appContext.js porque es una redirección externa y debe ejecutarse solo cuando llegamos aca
        const queryParams = new URLSearchParams(location.search)
        const obteinParams = Object.fromEntries(queryParams.entries());
        setParams(obteinParams)
        console.log('soy el params: ', obteinParams);
        actions.payment_status(obteinParams.id);

        return () => {                        // Cleanup en caso de desmontaje del componente, asi evitamos pérdidas de memoria
            console.log("Componente desmontado, evitando memory leaks.");
        };
    }, [location.search]);

    const handleNewSale = async () => {
        console.log("Iniciando proceso de venta...");
    
        console.log("Estado de checkoutCart antes de actualizar:", store.checkoutCart);
    
        const showCart = store.showCart;
        if (!showCart || Object.keys(showCart).length === 0) {
            console.log("Error: `showCart` está vacío antes de la venta.");
            return;
        }
    
        console.log("🔍 Estructura real de bookings:", showCart.bookings);
    
        const bookingIds = showCart.bookings?.map(booking => booking.booking_id) || [];
    
        actions.updateStore({
            checkoutCart: {
                bookings_ids: bookingIds,
                products: showCart.products,
                total: showCart.total
            }
        });
    
        console.log("Estado de checkoutCart después de actualizar:", store.checkoutCart);
    
        setTimeout(async () => {
            console.log(" CONFIRMACIÓN: Ejecutando create_new_sale()");
            const saleResponse = await actions.create_new_sale();
            console.log(" Respuesta de store-cinema:", saleResponse);
        
            console.log(" Llamando a clearCart() para vaciar el carrito después de la venta.");
            await actions.clearCart();
        
            console.log("🔍 Estado de store.payment_body antes de validar transacciones:", store.payment_body);
        
            await actions.validateTransactions();
        
            console.log("🔍 Estado de store.payment_body después de validar transacciones:", store.payment_body);
        }, 500);
        navigate('/');
    };
    

    return (
        <div className="container">
            {(params.status === "SUCCEEDED") ? (
                <div>
                    <h1 className="text-center mb-5 mt-5">PAYMENT SUCCESFULL</h1>

                    <h5 className="text-center mb-5">THANK YOU FOR BUYING!</h5>
                    <h5 className="text-center mb-4"> Your Resume:</h5>

                    {store.payment_body && (
                        <div>
                            <h5 className="text-center ">Description: {store.payment_body.description}</h5>
                            <h5 className="text-center ">Payment method: {store.payment_body.payment_method}</h5> 
                            <h5 className="text-center ">Card: {store.payment_body.card_brand?.toUpperCase()} (**** {store.payment_body.card_last4})</h5>
                        </div>
                    )}
                    <h5 className="text-center">Amount: {parseFloat(params.amount) / 100} {params.currency}</h5>
                    <h5 className="text-center ">Status: {params.message}</h5>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-light mt-5 mb-5" onClick={handleNewSale}>Home</button>
                    </div>
                </div>
            ) : (params.status === "FAILED") ? (
                <div>
                    <h1 className="text-center mb-5 mt-5">PAYMENT FAILED</h1>
                    <h3 className="text-center mb-5">Please try again</h3>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-primary mb-5" onClick={() => { navigate('/shopping-cart') }}>Shopping Cart</button>
                    </div>
                </div>
            ) : ("")
            }
        </div >
    );
};




