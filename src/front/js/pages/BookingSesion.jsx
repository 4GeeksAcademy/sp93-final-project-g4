import React, { useContext, useState } from "react";
import butacaSimple from "../../img/butaca-sin-uso.png";
import butacaSeleccionada from "../../img/butaca-uso.png";
import butacaReservada from "../../img/butaca-reservada.png";
import "../../styles/booking.css";
import { Context } from "../store/appContext";


export const BookingSesion = () => {

  const { store } = useContext(Context);

  print(store.showtimeId)

  const seatsInitial = [
    [0, 0, 0, 0, 0],  
    [1, 0, 0, 0, 0],  
    [0, 0, 2, 0, 0],  
    [0, 0, 0, 1, 0],  
    [0, 0, 0, 0, 0], 
  ];

  const [ seats, setSeats ] = useState(seatsInitial)
  const [ selectedSeat, setSelectedSeat ] = useState(null)

  const getSeatImage = (status) => {
    if (status === 1) {
      return butacaReservada; // Asiento reservado
    } else if (status === 2) {
      return butacaSeleccionada; // Asiento seleccionado
    } else {
      return butacaSimple; // Asiento disponible
    }
  };

  const handleSeat = (rowIndex, colIndex) => {
    
    if (seats[rowIndex][colIndex] === 1) return;

    const updatedSeats = seats.map((row, rIndex) =>
      row.map((seat, cIndex) => {
        if (rIndex === rowIndex && cIndex === colIndex) {
          if (seat === 2) {
            return 0; 
          } else {
            return 2; 
          }
        }
        return seat; 
      })
    );

    setSeats(updatedSeats);

    if (updatedSeats[rowIndex][colIndex] === 2) {
      setSelectedSeat({ row: rowIndex + 1, col: colIndex + 1 });
    } else {
      setSelectedSeat(null);
    }
  };

  return (
    <div className="container mt-5 text-center">
      {/* Pantalla */}
      <div className="screen my-3">Pantalla</div>

      <div className="seats">
        {seats.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row d-flex justify-content-center">
            {row.map((seat, colIndex) => (
              <div key={colIndex} className="seat" onClick={() => handleSeat(rowIndex, colIndex)}>
                <img 
                  src={getSeatImage(seat)} 
                  alt={`butaca ${rowIndex + 1}-${colIndex + 1}`} 
                  className="seat-img" 
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedSeat && (
        <div className="mt-3">
          <p>Asiento seleccionado: Fila {selectedSeat.row}, Columna {selectedSeat.col}</p>
        </div>
      )}
    </div>
  );
}