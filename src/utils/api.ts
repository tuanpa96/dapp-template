import axios from "axios";

let accessToken = "";
const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const setAccessToken = (_accessToken: string) => {
  accessToken = _accessToken;
};

export const getAccessToken = () => accessToken;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});
