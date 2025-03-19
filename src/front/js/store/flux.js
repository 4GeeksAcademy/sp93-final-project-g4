const getState = ({ getStore, getActions, setStore }) => {
	const url = "https://crispy-space-garbanzo-g6v5v6wr69r29jr5-3001.app.github.dev"


	return {
		store: {
			message: null,
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
			}
		}
	};
};

export default getState;
