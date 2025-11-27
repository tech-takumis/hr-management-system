import Axios from 'axios'

const axios = Axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'

    },
    withCredentials: true,
    withXSRFToken: true,
})

export default axios
