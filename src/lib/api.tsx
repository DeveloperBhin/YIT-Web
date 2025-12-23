import axios from "axios";

const api = axios.create({
  baseURL: "https://yit-apis.onrender.com/auth/", 
  // baseURL:"http://0.0.0.0:3002/auth/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
