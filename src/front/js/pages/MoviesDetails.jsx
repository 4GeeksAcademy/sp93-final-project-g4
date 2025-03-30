import React, { useContext, useEffect } from "react";
import "../../styles/movies-details.css";
import { Context } from "../store/appContext.js";
import { useParams } from "react-router-dom";

export const MoviesDetails = () => {

    const { store, actions } = useContext(Context);
    const { movieId } = useParams();

    useEffect(() => {
        actions.getMovieDetails(movieId)
    }, [movieId]);

    const movie = store.movieDetails;
    if (!movie) {
        return <p>Cargando detalles de la película...</p>;
    };

    return (
        <div>
            <div className="billboard mb-3">
                <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} alt={movie.title}></img>
            </div>
            <div style={{marginLeft: "1%"}}>
                <div className="justify-content-start mb-3" style={{marginLeft: "10%"}}>
                    <div className="col-md-7"> 
                        <div className="shadow-sm d-flex flex-row align-items-center" style={{fontSize: "large"}}>
                            <img 
                                className="img-fluid" 
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                style={{ width: "200px", height: "auto", borderRadius: "10px" }}>
                            </img>
                            <div className="p-3">
                                <h5 className="mt-3" style={{marginLeft: "20%"}}>{movie.title}</h5>
                                <p className="mt-3" style={{marginLeft: "20%"}}>
                                   <img 
                                        src="https://aficine.com/wp-content/themes/aficine-v2/assets/img/todoslospublicos.png" 
                                        style={{ width: "30px", height: "30px", marginRight: "15px" }} 
                                        alt="adult"
                                    />
                                    {movie.adult ? "Solo para adultos" : "Apto para todo el público"}
                                </p>
                                <div className="d-flex flex-row justify-content-start" style={{ marginLeft: "20%" }}>
                                    <div className="d-flex align-items-center me-5">
                                        <img 
                                            src="https://cdn-icons-png.freepik.com/256/4304/4304194.png" 
                                            style={{ width: "30px", height: "30px", marginRight: "10px", verticalAlign: "middle" }} 
                                            alt="runtime"
                                        />
                                        <span>{movie.runtime} min</span>
                                    </div>
                                    <div className="d-flex align-items-center ms-5">
                                        <img 
                                            src="https://cdn-icons-png.freepik.com/256/14640/14640575.png" 
                                            style={{ width: "30px", height: "30px", marginRight: "10px" }} 
                                            alt="genre"
                                        />
                                        <span>{movie.genre}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row justify-content-start mb-3" style={{marginLeft: "11%", marginRight: "10%"}}>
                <div className="col-12" style={{marginRight: "60%"}}>
                    <div className="d-flex flex-row bg-dark mb-3 w-100" style={{borderRadius: "5px", fontSize: "large"}}>
                        <div className="mx-3" style={{borderRadius: "5px", color: "white", padding: "5px"}}>Sala 1: </div>
                        <div className="mx-5 btn btn-outline-secondary" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>17:10</div>
                        <div className="mx-5 btn btn-outline-secondary" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>19:10</div>
                        <div className="mx-5 btn btn-outline-secondary" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>21:30</div>
                    </div>                      
                    <div className="d-flex flex-row bg-dark mb-3 w-100" style={{borderRadius: "5px", fontSize: "large"}}>
                        <div className="mx-3" style={{borderRadius: "5px", color: "white", padding: "5px"}}>Sala 2: </div>
                        <div className="mx-5 btn btn-outline-secondary" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>17:00</div>
                        <div className="mx-5 btn btn-outline-secondary" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>19:20</div>
                    </div>                      
                </div>
            </div>
            <div className="detalles row justify-content-start mb-3" style={{marginLeft: "15%", marginRight: "15%"}}>                           
                <h1>OVERVIEW</h1>
                <p>{movie.overview}</p>
                <h5>DIRECTOR</h5>
                <p>{movie.director || "No disponible"}</p>
                <h5>ACTORS</h5>
                <p>{movie.actors || "No disponible"}</p>
            </div>
            <div className="detalles">                           
                <h1>TRAILER</h1>
                <iframe 
                    width="1047" 
                    height="445" 
                    src="https://www.youtube.com/embed/j-RpvIuazmc" 
                    title="Stromae, Pomme - &quot;Ma Meilleure Ennemie&quot; (de la segunda temporada de Arcane) [Videoclip oficial]" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerpolicy="strict-origin-when-cross-origin" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    )
}
