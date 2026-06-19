import axios from "axios";

const api = axios.create({
  baseURL: "http://10.156.163.150:5000/api",
});

export default api;