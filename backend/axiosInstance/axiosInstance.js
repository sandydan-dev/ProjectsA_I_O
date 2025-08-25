const axios = require("axios");

// https://softech.free.beeceptor.com

const URL = "https://jsonplaceholder.typicode.com";

const axiosInstance = axios.create({
  baseURL: URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = { axiosInstance };
