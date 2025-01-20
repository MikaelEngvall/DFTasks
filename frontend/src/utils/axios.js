import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // Eller den port där din backend körs
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
