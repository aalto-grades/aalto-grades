import axios from './axios'

const login = async credentials => {
    console.log(credentials)
    //const response = await axios.post('/v1/auth/login', credentials)
    //return response.data
  }

  const signup = async credentials => {
    console.log(credentials)
    //const response = await axios.post('/v1/auth/signup', credentials)
    //return response.data
  }
  
  export default { login, signup }