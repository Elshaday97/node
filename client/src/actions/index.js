import axios from "axios";
import { FETCH_USER, FETCH_BLOGS, FETCH_BLOG } from "./types";

export const fetchUser = () => async (dispatch) => {
  const res = await axios.get("/api/current_user");

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const handleToken = (token) => async (dispatch) => {
  const res = await axios.post("/api/stripe", token);

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const submitBlog = (values, file, history) => async (dispatch) => {
  // Upload image first
  const uploadConfig = await axios.get("/api/upload"); // return signedURL and key
  const { data } = uploadConfig;

  // send a put req to the url (s3) with the file as payload
  await axios.put(data.signedUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });

  // Send the key and let our API extract the image from s3 using the key and append it to the newly created blog
  const res = await axios.post("/api/blogs", { ...values, imageUrl: data.key });

  history.push("/blogs");
  dispatch({ type: FETCH_BLOG, payload: res.data });
};

export const fetchBlogs = () => async (dispatch) => {
  const res = await axios.get("/api/blogs");

  dispatch({ type: FETCH_BLOGS, payload: res.data });
};

export const fetchBlog = (id) => async (dispatch) => {
  const res = await axios.get(`/api/blogs/${id}`);

  dispatch({ type: FETCH_BLOG, payload: res.data });
};
