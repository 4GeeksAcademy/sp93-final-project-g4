import React, { useContext } from "react";
import "../../styles/movies-details.css";
import { Context } from "../store/appContext";
import { useParams } from "react-router-dom";

export const BannerMovie = () => {

    const { store, actions } = useContext(Context);
        const { movieId } = useParams();
    
        useEffect(() => {
            actions.getMovieDetails(movieId)
        }, [movieId]);
    
        const movie = store.movieDetails;

    return(
        <div className="billboard mb-3">
            <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}></img>
        </div>
    )
}