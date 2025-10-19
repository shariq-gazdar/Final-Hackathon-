import axios from "axios";

const API = axios.create({
  baseURL: "https://final-hackathon-t3h5.vercel.app//api",
});

export default API;
