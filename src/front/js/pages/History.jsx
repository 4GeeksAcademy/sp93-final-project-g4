import React, { useContext } from "react";
import "../../styles/history.css"
import { Context } from "../store/appContext";

export const History = () => {

    const { store } = useContext(Context) 

    return !store.isLogged ? <Login /> : (

        <div class="container mt-5">
            <h1 class="text-center mb-5">Purchase History</h1>
            <div class="row">
                <div class="col-md-4">
                    <div class="card shadow">
                        <div class="card-body">
                            <h5 class="card-title">Captain America: Brave New World</h5>
                            <p><strong>Theater:</strong> Theater 2</p>
                            <p><strong>Date:</strong> 08/05/2025</p>
                            <p><strong>Hour:</strong> 18:40</p>
                            <p><strong>Movie ticket:</strong> 1 (5.00 EUR)</p>
                            <p><strong>Products:</strong></p>
                            <ul>
                                <li>Movie Ticket - 1 x 5.00 EUR</li>
                            </ul>
                            <p><strong>Total:</strong> 15.00 EUR</p>
                            <p><strong>State:</strong> <span class="status-failed">FAILED</span></p>
                            <p><strong>ID:</strong> 10ac1a6fadcdda8fa96e9af0ff443b1b05207656</p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card shadow">
                        <div class="card-body">
                            <h5 class="card-title">Avengers: Secret Wars</h5>
                            <p><strong>Theater:</strong> Theater 1</p>
                            <p><strong>Date:</strong> 10/05/2025</p>
                            <p><strong>Hour:</strong> 20:30</p>
                            <p><strong>Movie ticket:</strong> 2 (10.00 EUR)</p>
                            <p><strong>Products:</strong></p>
                            <ul>
                                <li>Movie Ticket - 2 x 5.00 EUR</li>
                                <li>Popcorn - 1 x 3.00 EUR</li>
                            </ul>
                            <p><strong>Total:</strong> 13.00 EUR</p>
                            <p><strong>State:</strong> <span class="status-success">COMPLETED</span></p>
                            <p><strong>ID:</strong> abcdef1234567890</p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card shadow">
                        <div class="card-body">
                            <h5 class="card-title">Spider-Man: Beyond the Spider-Verse</h5>
                            <p><strong>Theater:</strong> Theater 3</p>
                            <p><strong>Date:</strong> 12/05/2025</p>
                            <p><strong>Hour:</strong> 17:00</p>
                            <p><strong>Movie ticket:</strong> 1 (5.00 EUR)</p>
                            <p><strong>Products:</strong></p>
                            <ul>
                                <li>Movie Ticket - 1 x 5.00 EUR</li>
                            </ul>
                            <p><strong>Total:</strong> 5.00 EUR</p>
                            <p><strong>State:</strong> <span class="status-success">COMPLETED</span></p>
                            <p><strong>ID:</strong> xyz987654321</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}