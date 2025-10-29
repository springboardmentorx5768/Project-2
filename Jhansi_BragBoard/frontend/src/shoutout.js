// src/api/shoutout.js
import API from "./axios.js";

export const getShoutouts = async () => {
  return await API.get("/shoutouts");
};

export const postShoutout = async (data) => {
  return await API.post("/shoutouts", data);
};
