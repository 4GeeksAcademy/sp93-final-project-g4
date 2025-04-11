import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import butacaSimple from "../../img/butaca-sin-uso.png";
import butacaSeleccionada from "../../img/butaca-uso.png";
import butacaReservada from "../../img/butaca-reservada.png";
import "../../styles/booking.css";
import { Context } from "../store/appContext";


export const BookingSesion = () => {

  const { store, actions } = useContext(Context);
  const [selectedSeat, setSelectedSeat] = useState([])
  const showtime = store.showtimeId;
  const { row_max, col_max, reserved_seats = [] } = showtime;
  const navigate = useNavigate();

  const seats = [];
  for (let row = 1; row <= row_max; row++) {
    const seatRow = [];
    for (let col = 1; col <= col_max; col++) {
      const isReserved = reserved_seats.some(
        seat => seat.row === row && seat.col === col
      );
      seatRow.push({ row, col, isReserved });
    }
    seats.push(seatRow);
  }

  const isSelected = (row, col) => {
    return selectedSeat.some(seat => seat.row === row && seat.col === col);
  }

  const toggleSeat = (row, col) => {
    if (seats[row - 1][col - 1].isReserved) return;

    const exists = isSelected(row, col);

    if (exists) {
      setSelectedSeat(prev => prev.filter(seat => seat.row !== row || seat.col !== col));
    } else {
      setSelectedSeat(prev => [...prev, { row, col }]);
    }
  };

  const handleReserve = () => {
    if (selectedSeat.length === 0) return;

    actions.reserveBookings(showtime.id, selectedSeat);
    navigate("/snack-bar");      
  };

  return (
    <div className="container mt-5 text-center">
      <div className="screen my-3">Pantalla</div>

      <div className="seats">
        {seats.map((row, rowIndex) => (
          <div key={rowIndex} className="d-flex justify-content-center mb-2">
            {row.map((seat) => {
              const { row, col, isReserved } = seat;
              const selected = isSelected(row, col);

              let seatImage = butacaSimple;
              if (isReserved) seatImage = butacaReservada;
              else if (selected) seatImage = butacaSeleccionada;

              return (
                <img
                  key={`${row}-${col}`}
                  src={seatImage}
                  alt={`Asiento ${row}-${col}`}
                  onClick={() => toggleSeat(row, col)}
                  style={{
                    width: "40px",
                    height: "40px",
                    margin: "5px",
                    cursor: isReserved ? "not-allowed" : "pointer",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
 
      <button className="btn btn-danger" onClick={handleReserve}>Buy bookings</button> 

      {selectedSeat.length > 0 && (
        <div className="mt-3">
          <p>Asientos seleccionados:</p>
          <ul style={{listStyle: "none"}}>
            {selectedSeat.map((seat, i) => (
              <li key={i}>Fila {seat.row}, Columna {seat.col}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}