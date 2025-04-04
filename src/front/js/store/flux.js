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
			showtimeMovie: [],
			alert: {text: '', visible: false, background: 'primary'},
		},
		actions: {
			getShowtimes: async (movieId) => {
				const response = await fetch(`${process.env.BACKEND_URL}/api/showtime/${movieId}/details`)
				{
					method: 'GET'
				}
			if (!response.ok) {
				console.log("Error getShowtimes: ", response.status, response.statusText)
				return;
			}
			const data = await response.json()
			setStore({showtimeMovie: data.showtime})
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
				setStore({movieDetails: {...data.result, movieId}})
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
						user: data.first_name,
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
				console.log(data)
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
			editProfile: async (userUpdate) =>{
				const uri = `${process.env.BACKEND_URL}/api/user-detail`;
				const token = localStorage.getItem('token');
				const options ={
					method: 'PUT',
					headers: {
						"Content-Type" : "Application/json",
						"Authorization" : `Bearer ${token}`
					},
					body : JSON.stringify(userUpdate)
				};
				const response = await fetch(uri, options)
				if (!response.ok){
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
					alert: { visible: true, text: "Log out successful", background: "danger" } })
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
				setStore({ movieList: data.results})
			},
		}
	};
};

export default getState;
