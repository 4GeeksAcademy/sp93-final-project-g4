import React from "react";
import "../../styles/movies-details.css";

export const MoviesDetails = () => {



    return (
        <div>
            <div className="billboard mb-3">
                <img src="https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/oHPoF0Gzu8xwK4CtdXDaWdcuZxZ.jpg"></img>
            </div>
            <div style={{marginLeft: "1%"}}>
                <div className="row justify-content-start mb-3" style={{marginLeft: "10%"}}>
                    <div className="col-md-7"> 
                        <div className="shadow-sm d-flex flex-row align-items-center" style={{fontSize: "large"}}>
                            <img 
                                className="img-fluid" 
                                src="https://res.cloudinary.com/odeoncloud/w_570%2Ch_815%2Cf_auto%2Cq_85/c_scale%2Cg_south_east%2Cl_wcloud:odeon:tags:anticipada.png%2Cw_192/v1742829190/wcloud/odeon/ps_11326.jpg"
                                style={{ width: "200px", height: "auto", borderRadius: "10px" }}
                                alt="Movie">
                            </img>
                            <div className="p-3">
                                <h5 className="mt-3" style={{marginLeft: "20%"}}>Title</h5>
                                <p className="mt-3" style={{marginLeft: "20%"}}>
                                   <img 
                                        src="https://cdn-icons-png.freepik.com/256/5110/5110881.png?ga=GA1.1.2027331089.1732724367&semt=ais_hybrid" 
                                        style={{width: "7%", marginRight: "15px"}} 
                                    />
                                    Adult
                                </p>
                                <div className="d-flex flex-row">
                                    <p className="me-5 d-flex flex-row" style={{marginLeft: "20%"}}>
                                        <img 
                                            src="https://cdn-icons-png.freepik.com/256/4304/4304194.png?ga=GA1.1.2027331089.1732724367&semt=ais_hybrid" 
                                            style={{width: "20%", marginRight: "15px"}} 
                                        />
                                        Runtime
                                    </p>
                                    <p style={{marginLeft: "20%"}} className="me-5 d-flex flex-row">
                                        <img 
                                            src="https://cdn-icons-png.freepik.com/256/14640/14640575.png?ga=GA1.1.2027331089.1732724367&semt=ais_hybrid" 
                                            style={{width: "30%", marginRight: "15px"}} 
                                        />
                                        Gender
                                    </p>
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
                        <div className="mx-5" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>17:10</div>
                        <div className="mx-5" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>19:10</div>
                        <div className="mx-5" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>21:30</div>
                    </div>                      
                    <div className="d-flex flex-row bg-dark mb-3 w-100" style={{borderRadius: "5px", fontSize: "large"}}>
                        <div className="mx-3" style={{borderRadius: "5px", color: "white", padding: "5px"}}>Sala 2: </div>
                        <div className="mx-5" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>17:00</div>
                        <div className="mx-5" style={{borderRadius: "5px", color: "white", border: "2px solid white", padding: "5px", borderRadius: "20px", paddingLeft: "20px", paddingRight: "20px"}}>19:20</div>
                    </div>                      
                </div>
            </div>
            <div className="detalles">                           
                <h1>OVERVIEW</h1>
                <p>Resumen</p>
                <h5>DIRECTOR</h5>
                <p>Nombre del director</p>
                <h5>ACTORS</h5>
                <p>Nombres de los actores</p>
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
