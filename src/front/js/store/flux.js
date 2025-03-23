const getState = ({ getStore, getActions, setStore }) => {
	const url = "https://crispy-space-garbanzo-g6v5v6wr69r29jr5-3001.app.github.dev"


	return {
		store: {
			message: null,
			isLogged: false,
			isAdmin: false,
			user: {}
		},
		actions: {
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
				})
				localStorage.setItem('token', data.access_token)
				localStorage.setItem('user', JSON.stringify(data.results))
			}
		}
	};
};

export default getState;
