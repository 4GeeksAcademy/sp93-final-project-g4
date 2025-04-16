import React, { useContext, useState } from "react";
import "../../styles/movies-details.css";
import { Context } from "../store/appContext.js";
import { useNavigate } from "react-router-dom";


export const MoviesDetails = () => {
    
    const navigate = useNavigate()
    const { store, actions } = useContext(Context);
    const [ selectedDay, setSelectedDay ] = useState(null);

    const dateDay = store.showtimeMovie.reduce((listShowtime, showtime) => {
        const day = showtime.date_time_day;
        if (!listShowtime[day]) listShowtime[day] = [];
        listShowtime[day].push(showtime)
        return listShowtime;
    }, {});

    const allDays = Object.keys(dateDay);
    if (allDays.length > 0 && !selectedDay) {
        setSelectedDay(allDays[0]);
    }

    const handleClickShowtime = (showtimeId) => {
        actions.getShowtimeSeats(showtimeId); 
        navigate(`/booking-sesion/${showtimeId}`); 
    };

    return (
        <div className="mb-5">
            <div className="billboard mb-3 mt-3" style={{ marginLeft: "10%", marginRight: "10%" }}>
                <img src={`https://image.tmdb.org/t/p/original${store.movieDetails.backdrop_path}`} alt={store.movieDetails.title} style={{ borderRadius: "20px" }} />
            </div>
            <div>
                <div className="d-flex flex-wrap mb-4" style={{ marginLeft: "10%", marginRight: "10%", backgroundColor: "black", borderRadius: "10px" }}>
                    {allDays.length  > 0 ? (
                        allDays.map((day) => (
                            <button
                                key={day} onClick={() => setSelectedDay(day)} className={`btn mx-2 mb-2 ${selectedDay === day ? 'btn-ligth' : 'btn-outline-ligth'}`} style={{ borderRadius: "20PX", padding: "10px 20px" }}
                            >
                                {day}
                            </button>
                        ))
                    ) : (
                        <p></p>
                    )}
                </div>
                <div className="justify-content-start mb-3" style={{ marginLeft: "10%" }}>
                    <div className="col-md-7"> 
                        <div className="shadow-sm d-flex flex-row align-items-center" style={{fontSize: "large"}}>
                            <img 
                                className="img-fluid" 
                                src={`https://image.tmdb.org/t/p/w500${store.movieDetails.poster_path}`}
                                alt={store.movieDetails.title}
                                style={{ width: "200px", height: "auto", borderRadius: "10px" }}>
                            </img>
                            <div className="p-3">
                                <h5 className="mt-3" style={{ marginLeft: "20%", marginBottom: "10%" }}>{store.movieDetails.title}</h5>
                                <p className="mt-3" style={{ marginLeft: "20%", marginTop: "10%", marginBottom: "10%" }}>
                                   <img 
                                        src="https://aficine.com/wp-content/themes/aficine-v2/assets/img/todoslospublicos.png" 
                                        style={{ width: "30px", height: "30px", marginRight: "15px" }} 
                                        alt="adult"
                                    />
                                    {store.movieDetails.adult ? "Solo para adultos" : "Apto para todo el público"}
                                </p>
                                <div className="d-flex flex-row justify-content-start" style={{ marginLeft: "20%", marginTop: "10%" }}>
                                    <div className="d-flex align-items-center me-5">
                                        <img 
                                            src="https://cdn-icons-png.freepik.com/256/4304/4304194.png" 
                                            style={{ width: "30px", height: "30px", marginRight: "10px", verticalAlign: "middle" }} 
                                            alt="runtime"
                                        />
                                        <span>{store.movieDetails.runtime} min</span>
                                    </div>
                                    <div className="d-flex align-items-center ms-5">
                                        <img 
                                            src="https://cdn-icons-png.freepik.com/256/14640/14640575.png" 
                                            style={{ width: "30px", height: "30px", marginRight: "10px" }} 
                                            alt="genre"
                                        />
                                        <span>{store.movieDetails.genre}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="justify-content-start mb-3" style={{ marginLeft: "10%", marginRight: "10%" }}>
                <div>
                    {selectedDay && dateDay[selectedDay] && dateDay[selectedDay].length > 0 ? ( 
                        Object.entries(
                            dateDay[selectedDay].reduce((groupedRoom, showtime) => {
                                const room = showtime.cinema_room;
                                if (!groupedRoom[room]) groupedRoom[room] = [];
                                groupedRoom[room].push(showtime);
                                return groupedRoom
                            }, {})
                            ).map(([roomName, horarios]) => (
                                <div
                                    className="d-flex flex-row bg-dark mb-3 w-100"
                                    style={{ borderRadius: "5px", fontSize: "large" }}
                                    key={roomName}
                                >
                                    <div className="mx-3" style={{ color: "white", padding: "5px" }}>
                                        {roomName}: 
                                    </div>
                                    {horarios.length > 0 ? (
                                        horarios.map((hora) => (
                                            <button key={hora.id} className="mx-3 btn btn-outline-secondary"
                                             style={{ color: "white", border: "2px solid white", padding: "5px 20px", borderRadius: "20px" }} 
                                             onClick={() => handleClickShowtime(hora.id)}>
                                                {hora.date_time_hour}
                                            </button>
                                        ))
                                    ) : (
                                        <div></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div></div>
                        )}
                </div>
            </div>
            <div className="detalles" style={{ marginLeft: "10%", marginRight: "10%", padding: "2rem", borderRadius: "5px", color: "#e0b9eb", boxShadow: "0 4px 10px rgba(212, 7, 212, 0.6)" }}>                           
                <h3 style={{ borderBottom: "2px solid rgba(255,255,255,0.2)", paddingBottom: "0.5rem" }}>OVERVIEW</h3>
                <p style={{ fontSize: "1.1rem", lineHeight: "2", color: "#ddd" }}>{store.movieDetails.overview}</p>
                <h3 style={{ borderBottom: "2px solid rgba(255,255,255,0.2)", paddingBottom: "0.5rem" }}>DIRECTOR</h3>
                <p style={{ fontSize: "1.1rem", lineHeight: "2", color: "#ddd" }}>{store.movieDetails.director || "No disponible"}</p>
                <h3 style={{ borderBottom: "2px solid rgba(255,255,255,0.2)", paddingBottom: "0.5rem" }}>ACTORS</h3>
                <p style={{ fontSize: "1.1rem", lineHeight: "2", color: "#ddd" }}>{store.movieDetails.actors || "No disponible"}</p>
            </div>
            {/* <div className="detalles mt-5" style={{ marginLeft: "10%", marginRight: "10%", padding: "2rem", borderRadius: "5px", color: "#e0b9eb", boxShadow: "0 4px 10px rgba(212, 7, 212, 0.6)" }}>
            </div>
            <div className="detalles mt-5" style={{ marginLeft: "10%", marginRight: "10%", padding: "2rem", borderRadius: "5px", color: "#e0b9eb", boxShadow: "0 4px 10px rgba(212, 7, 212, 0.6)" }}>
            </div> */}
            <div className="detalles mt-5" style={{ marginLeft: "10%", marginRight: "10%", padding: "2rem", borderRadius: "5px", color: "#e0b9eb", boxShadow: "0 4px 10px rgba(212, 7, 212, 0.6)" }}>                           
                <h3 style={{ borderBottom: "2px solid rgba(255,255,255,0.2)", paddingBottom: "0.5rem" }}>TRAILER</h3>
                {store.movieDetails.trailer ? (
                    <div className="d-flex justify-content-center">
                        <iframe
                            width="720"
                            height="405"
                            src={`https://www.youtube.com/embed/${store.movieDetails.trailer}`}
                            title="YouTube video trailer"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ borderRadius: "15px", boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)" }}
                        ></iframe>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-light">No trailer available</p>
                        <img
                            src="https://cdn-icons-png.flaticon.com/128/1466/1466122.png"
                            alt="No trailer available"
                            style={{ width: '150px', height: 'auto', marginTop: '0.7' }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
