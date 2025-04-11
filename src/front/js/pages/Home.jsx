import React, { useContext } from "react";
import { Context } from "../store/appContext.js";
import "../../styles/home.css";
import { CarouselHome } from "../component/Carousel.jsx";
import { useNavigate } from "react-router-dom";


export const Home = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    const handleMovies = (id) => {
        navigate(`/movies-details/${id}`)
        actions.getMovieDetails(id)
        actions.getShowtimes(id)
    }

    return (

        <div className="mb-4">
            <CarouselHome />
            <div className="container mt-5">
                <h4> <span className="text-light fs-2">Cinema Center /</span> New Movies</h4>
                <hr className="border border-primary border-3 opacity-75" />
                <div className="row row-cols-1 row-cols-md-4 g-4"  >
                    {store.movieList.map((movie) => (
                        <div className="col" key={movie.id}>
                            <div className="card movie-card h-100">
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="card-img-top movie-poster"
                                    onClick={() => handleMovies(movie.id)}
                                />
                                <div className="card-body">
                                    <h5 className="card-title movie-title">{movie.title}</h5>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
