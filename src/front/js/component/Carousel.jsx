import React, { useContext } from "react";
import Carousel from 'react-bootstrap/Carousel';
import { Context } from "../store/appContext";


export const CarouselHome = () => {

    const { store } = useContext(Context)

    return (
        <Carousel>
            {
                store.movieList.map((movie) => (
                    <Carousel.Item key={movie.id}>
                        <img
                            src={`https://media.themoviedb.org/t/p/w1066_and_h600_bestv2${movie.backdrop_path}`}
                            className="d-block mx-auto carousel-image"
                            alt={movie.title} // Usando el título de la película como texto alternativo
                        />
                    </Carousel.Item>
                ))
            }
        </Carousel>
    )
} 