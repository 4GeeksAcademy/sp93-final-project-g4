import React, { useContext } from "react";
import "../../styles/history.css";
import { Context } from "../store/appContext";
import { Login } from "./Login.jsx";

export const History = () => {
    const { store } = useContext(Context);

    return !store.isLogged ? <Login /> : (
        <div className="container mt-5">
            <h1 className="text-center mb-5">Purchase History</h1>
            <div className="row">
                {store.history && store.history.length > 0 ? (
                    store.history.map(sale => {
                        const bookingItems = sale.sales_lines.filter(item => item.type === "booking");
                        const productItems = sale.sales_lines.filter(item => item.type === "product");

                        const firstBooking = bookingItems[0];
                        const date = firstBooking ? firstBooking.booking.time.split(" ")[0] : "N/A";
                        const hour = firstBooking ? firstBooking.booking.time.split(" ")[1] : "N/A";

                        return (
                            <div className="col-md-4 mb-4" key={sale.sale_id}>
                                <div className="card shadow">
                                    <div className="card-body">
                                        <h5 className="card-title">{firstBooking.booking.movie}</h5>
                                        <p><strong>Theater:</strong> {firstBooking.booking.room}</p>
                                        <p><strong>Date:</strong> {date}</p>
                                        <p><strong>Hour:</strong> {hour}</p>
                                        <p><strong>Movie ticket:</strong> {bookingItems.length} ({(bookingItems.reduce((acc, b) => acc + b.unit_price, 0)).toFixed(2)} EUR)</p>

                                        <p><strong>Products:</strong></p>
                                        <ul>
                                            {bookingItems.map(item => (
                                                <li key={item.id}>Movie Ticket - {item.quantity} x {item.unit_price.toFixed(2)} EUR</li>
                                            ))}
                                            {productItems.map(item => (
                                                <li key={item.id}>{item.product.name} - {item.quantity} x {item.unit_price.toFixed(2)} EUR</li>
                                            ))}
                                        </ul>

                                        <p><strong>Total:</strong> {sale.total.toFixed(2)} EUR</p>
                                        {firstBooking && firstBooking.booking.qr && (
                                            <div>
                                                <img src={`${firstBooking.booking.qr}`} alt="Booking QR" className="img-fluid mb-3" style={{width: "120px"}} />
                                            </div>
                                        )}
                                        <p><strong>State:</strong> <span className="status-success">COMPLETED</span></p>
                                        <p><strong>ID:</strong> {sale.sale_id}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center">No purchases yet.</p>
                )}
            </div>
        </div>
    );
}
