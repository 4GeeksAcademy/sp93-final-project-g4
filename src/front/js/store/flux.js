
const getState = ({ getStore, getActions, setStore }) => {
	const url = "https://crispy-space-garbanzo-g6v5v6wr69r29jr5-3001.app.github.dev"


	return {
		store: {
			message: null,
			isLogged: false,
			isAdmin: false,
			user: {},
			movieList: [],
			movieDetails: {},
			showtimeId: {},
			productList: [],
			showCart: [],
			currentCart: {},
			showtimeMovie: [],
			reserve: {},
			isLoadingUser: true,
			checkoutCart: {},
			payment_link: "",
			current_payment_id: "",
			payment_body: {},
			alert: { text: '', visible: false, background: 'primary' },
		},
		actions: {
			updateStore: (updates) => {
				const store = getStore();
				setStore({
					...store,  //  Mantenemos el estado actual
					...updates  //  Aplicamos las actualizaciones enviadas
				});
			},
			getShowtimes: async (movieId) => {
				const response = await fetch(`${process.env.BACKEND_URL}/api/showtime/${movieId}/details`,
					{
						method: 'GET'
					})

				if (!response.ok) {
					console.log("Error getShowtimes: ", response.status, response.statusText)
					return;
				}
				const data = await response.json()
				setStore({ showtimeMovie: data.showtime })
			},
			getMovieDetails: async (movieId) => {
				const response = await fetch(`${process.env.BACKEND_URL}/api/movies/${movieId}`,
					{
						method: 'GET'
					})
				if (!response.ok) {
					console.log("Error getMovieDetails: ", response.status, response.statusText)
					return;
				}
				const data = await response.json()
				setStore({ movieDetails: { ...data.result, movieId } })
			},
			register: async (newUser) => {
				const response = await fetch(`${process.env.BACKEND_URL}/api/register`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(newUser),
					}
				)
				if (!response.ok) {
					console.log('Error registering user', response.status, response.statusText)
					throw new Error("Failed to register")
				}

				const data = await response.json()
				console.log("User registered successfuly: ", data)
				setStore({
					isLogged: true,
					isAdmin: data.results.is_admin,
					user: data.results,
					alert: { visible: true, text: "Register successful", background: "success" }
				})
				setTimeout(() => {
					setStore({ alert: { visible: false, text: "", background: "" } });
				}, 2000);

				localStorage.setItem('token', data.access_token)
				localStorage.setItem('user', JSON.stringify(data.results))
			},
			getMessage: async () => {
				const uri = `${process.env.BACKEND_URL}/api/hello`;
				const response = await fetch(uri)
				if (!response.ok) {
					console.log("Error", response.status, response.statusText)
					return
				}
				const data = await response.json()
				setStore({ message: data.message })
			},
			isUserLogged: () => {
				const data = JSON.parse(localStorage.getItem('user'));
				if (data) {
					setStore({
						isLogged: true,
						isAdmin: data.is_admin,
						user: data.username,
						isLoadingUser: false
					})
				}
			},
			login: async (userLogin) => {
				const response = await fetch(`${process.env.BACKEND_URL}/api/login`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(userLogin),
					}
				)
				if (!response.ok) {
					console.log('Error for loggin', response.status, response.statusText)
				}

				const data = await response.json()
				/* console.log(data) */
				setStore({
					isLogged: true,
					isAdmin: data.results.is_admin,
					user: data.results,
					alert: { visible: true, text: "Login successful", background: "success" }
				})
				setTimeout(() => {
					setStore({ alert: { visible: false, text: "", background: "" } });
				}, 2000);

				localStorage.setItem('token', data.access_token)
				localStorage.setItem('user', JSON.stringify(data.results))
			},
			editProfile: async (userUpdate) => {
				const uri = `${process.env.BACKEND_URL}/api/users/${userUpdate.id}`;
				const token = localStorage.getItem('token');
				const options = {
					method: 'PUT',
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify(userUpdate)
				};
				console.log(userUpdate, typeof (userUpdate))
				console.log(options)
				const response = await fetch(uri, options)
				console.log(response)
				if (!response.ok) {
					console.error("Error update: ", response.status, response.statusText)
					return
				};
				const data = await response.json();
				console.log('soy el data del edit', data);
				setStore({
					user: data.results
				})
				localStorage.setItem('user', JSON.stringify(data.results))
			},
			logout: () => {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				setStore({
					user: {},
					isLogged: false,
					isAdmin: false,
					alert: { visible: true, text: "Log out successful", background: "danger" }
				})
				setTimeout(() => {
					setStore({ alert: { visible: false, text: "", background: "" } });
				}, 2000);
			},
			getPopularMovies: async () => {
				const response = await fetch(`${process.env.BACKEND_URL}/api/movies`,
					{
						method: 'GET'
					})

				if (!response.ok) {
					console.log('Error', response.status, response.statusText)
					return;
				}

				const data = await response.json()
				setStore({ movieList: data.results })
			},
			getShowtimeSeats: async (showtimeId) => {
				const response = await fetch(`${process.env.BACKEND_URL}/api/showtime/${showtimeId}/seats`,
					{
						method: 'GET'
					})

				if (!response.ok) {
					console.log('Error', response.status, response.statusText)
					return;
				}

				const data = await response.json()
				console.log(data)
				setStore({ showtimeId: { ...data.details, id: data.details.id } })
			},
			getProducts: async () => {
				const token = localStorage.getItem('token')
				const response = await fetch(`${process.env.BACKEND_URL}/api/products`,
					{
						method: 'GET',
						headers: {
							"Authorization": `Bearer ${token}`
						},
					})

				if (!response.ok) {
					console.log('Error', response.status, response.statusText);
					return;
				}

				const data = await response.json()
				setStore({ productList: data.results })
			},
			addCart: async (product) => {
				const token = localStorage.getItem('token')
				const response = await fetch(`${process.env.BACKEND_URL}/api/cart/add`,
					{
						method: 'POST',
						headers: {
							"Content-Type": "Application/json",
							"Authorization": `Bearer ${token}`
						},
						body: JSON.stringify(product)
					})

				if (!response.ok) {
					console.log('Error', response.status, response.statusText);
					return;
				}

				const data = await response.json()

				setStore({ alert: { visible: true, text: `${data.message}`, background: "success" } })
				setTimeout(() => {
					setStore({ alert: { visible: false, text: "", background: "" } });
				}, 2000);
				getActions().viewCart()

			},
			viewCart: async () => {
				const token = localStorage.getItem('token')
				const response = await fetch(`${process.env.BACKEND_URL}/api/cart`,
					{
						method: 'GET',
						headers: {
							"Authorization": `Bearer ${token}`
						}
					})
				if (!response.ok) {
					console.log('Error', response.status, response.statusText);
					return;
				}
				const data = await response.json()
				/* console.log(data); */
				setStore({ showCart: data })
			},
			reserveBookings: async (idSesion, reserve) => {
				const token = localStorage.getItem('token')
				const response = await fetch(`${process.env.BACKEND_URL}/api/book-ticket`,
					{
						method: 'POST',
						headers: {
							"Content-Type": "Application/json",
							"Authorization": `Bearer ${token}`
						},

						body: JSON.stringify({
							showtime_id: idSesion,
							seats_booked: reserve
						})
					})

				if (!response.ok) {
					console.log("Error", response.status, response.statusText);
					return;
				}

				// const data = await response.json()
				// console.log(data);

				getActions().viewCart()
			},
			checkout: async (idBooking) => {
				const token = localStorage.getItem('token');
				const response = await fetch(`${process.env.BACKEND_URL}/api/create-payment`, {
					method: 'POST',
					headers: {
						"Content-Type": "Application/json",
						"Authorization": `Bearer ${token}`
					},
					body: JSON.stringify(idBooking)
				});
				if (!response.ok) {
					console.log("Error en checkout:", response.status, response.statusText);
					return;
				}
				const data = await response.json();
				/* console.log('Este es el data del checkout:', data); */
			
				const bookingIds = data.bookings.map(booking => booking.booking_id); // Aseguramos que extrae correctamente los booking_ids
				/* console.log('Aquí los Ids de las reservas:', bookingIds); */
			
				setStore({
					payment_link: data.your_payment_link,
					current_payment_id: data.payment_id,
					checkoutCart: {  
						bookings_ids: bookingIds, // Ahora `checkoutCart` tendrá los booking_ids correctos  
						products: data.products,
						total: data.total}
				});
				/* console.log('Estado de checkoutCart después de actualizar:', getStore().checkoutCart); */
			},
			payment_status: async (id) => {
				const token = localStorage.getItem('token')
				const response = await fetch(`${process.env.BACKEND_URL}/api/payment-status/${id}`,
					{
						method: 'GET',
						headers: {
							"Content-Type": "Application/json",
							"Authorization": `Bearer ${token}`
						},

					})
				if (!response.ok) {
					console.log("Error", response.status, response.statusText);
					return;
				}
				const data = await response.json()
				console.log('soy el data del payment_status: ', data);
				setStore({ payment_body: data })
			},
			create_new_sale: async () => {
				const store = getStore();
				const token = localStorage.getItem('token');
				/* console.log('Esto es el checkoutCart que tengo:', store.checkoutCart);
				console.log('este es el currentCart que recibi: ', store.currentCart || []); */
			
				if (!store.checkoutCart || !store.checkoutCart.bookings_ids || store.checkoutCart.bookings_ids.length === 0) {
					console.log('Error: No hay una reserva válida para procesar la venta.');
					return;
				}
				if (!store.showCart || Object.keys(store.showCart).length === 0) {
					console.log('Error: El carrito está vacío.');
					return;
				}
				const saleData = {
					booking_ids: store.checkoutCart.bookings_ids,
					cart: store.showCart
				};
				/* console.log('Estos son los datos enviados al store-cinema:', saleData);
			 */
				const response = await fetch(`${process.env.BACKEND_URL}/api/store-cinema`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					},
					body: JSON.stringify(saleData)
				});
				if (!response.ok) {
					console.log("Error en create_new_sale:", response.status, response.statusText);
					return;
				}
				const data = await response.json();
				/* console.log('Venta creada con éxito:', data); */
				if (response.ok) {
					console.log(' Venta creada con éxito:', data);
					const actions = getActions()
					actions.updateStore({
						showCart: [],
						checkoutCart: {},
						currentCart: {}
					});
					const clearCartResponse = await fetch(`${process.env.BACKEND_URL}/api/cart/clear`, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (!clearCartResponse.ok) {
						console.log("Error al limpiar el carrito en el backend:", clearCartResponse.status, clearCartResponse.statusText);
					} else {
						console.log(" Carrito vaciado correctamente en el backend.");
					}
					await actions.validateTransactions(); 
				} else {
					console.log("Error en create_new_sale:", response.status, response.statusText);
				}
			},
			clearCart: async () => {
				const token = localStorage.getItem('token');
				const response = await fetch(`${process.env.BACKEND_URL}/api/cart/clear`, {
					method: 'DELETE',
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					}
				});
			
				if (!response.ok) {
					console.log("Error al limpiar el carrito:", response.status, response.statusText);
					return;
				}
			
				/* console.log("Carrito vaciado correctamente después de la venta."); */
			},
			validateTransactions: async () => {
				const token = localStorage.getItem('token');
			
				const response = await fetch(`${process.env.BACKEND_URL}/api/user-transactions`, {
					method: "GET",
					headers: {
						"Authorization": `Bearer ${token}`
					}
				});
			
				if (!response.ok) {
					console.log("Error al obtener transacciones:", response.status, response.statusText);
					return;
				}
			
				const data = await response.json();
				/* console.log("Transacciones del usuario:", data); */
			
				setStore({ payment_body: data });  // Guardamos las transacciones en el store para poder usarlas en la UI
			}
		}
	}
};


export default getState;
