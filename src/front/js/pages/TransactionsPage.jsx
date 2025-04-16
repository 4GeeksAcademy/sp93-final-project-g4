import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import "./../../styles/index.css";

export const TransactionsPage = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.validateTransactions(); 
    }, []);

    return (
        <div>
            <h3 className="text-center mt-5 mb-5">Your Transactions Resume</h3>
            <div className="container rounded-1">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">User Email</th>
                            <th scope="col">Payment Method</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Currency</th>
                            <th scope="col">Status</th>
                            <th scope="col">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {store.transactions?.length > 0 ? (
                            store.transactions.map((transaction, index) => (
                                <tr key={transaction.payment_id}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{transaction.user_email}</td>
                                    <td>{transaction.payment_method || "Unknown"}</td>
                                    <td>{transaction.amount} </td>
                                    <td>{transaction.currency}</td>
                                    <td>{transaction.status}</td>
                                    <td>{new Date(transaction.created_at * 1000).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No transactions found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};