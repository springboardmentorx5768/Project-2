import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

class ApiService {
  getToken() {
    return localStorage.getItem("access_token");
  }

  getHeaders() {
    const token = this.getToken();
    return { Authorization: `Bearer ${token}` };
  }

  // -------------------- AUTH --------------------
  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Registration failed");
    return await res.json();
  }

  async login(credentials) {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
    return await res.json();
  }

  async getUserProfile() {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to fetch profile");
    return await res.json();
  }

  // -------------------- GET ALL USERS --------------------
  async getAllUsers() {
    const res = await fetch(`${API_BASE_URL}/users/all`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  }

  // -------------------- IMAGE UPLOAD --------------------
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(`${API_BASE_URL}/shoutouts/upload-image`, formData, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.image_url;
  }

  // -------------------- CREATE SHOUTOUT --------------------
  async createShoutout({ title, message, receiver_id, tagged_user_ids = [], category, is_public, imageFile }) {
    let image_url = null;
    if (imageFile) image_url = await this.uploadImage(imageFile);

    const payload = { title, message, receiver_id, tagged_user_ids, category, is_public, image_url };

    const res = await axios.post(`${API_BASE_URL}/shoutouts/create`, payload, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });

    return res.data;
  }

  // -------------------- GET SHOUTOUTS (FEED) --------------------
  async getShoutouts({ department = "all", skip = 0, limit = 50 } = {}) {
    const res = await fetch(`${API_BASE_URL}/shoutouts/feed?department=${department}&skip=${skip}&limit=${limit}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to fetch shoutouts");
    return await res.json();
  }

  // -------------------- GET MY SHOUTOUTS --------------------
  async getMyShoutouts({ receiver_department = "all", days } = {}) {
    let url = `${API_BASE_URL}/shoutouts/my-shoutouts?receiver_department=${receiver_department}`;
    if (days) url += `&days=${days}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to fetch my shoutouts");
    }
    return await res.json();
  }
  

  // -------------------- SEARCH USERS --------------------
  async searchUsers({ department = "all", search = "" } = {}) {
    const res = await fetch(`${API_BASE_URL}/shoutouts/users/search?department=${department}&search=${search}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to search users");
    return await res.json();
  }

  // -------------------- REACTIONS --------------------
  async addReaction(shoutout_id, reaction_type) {
    const res = await axios.post(
      `${API_BASE_URL}/reactions/${shoutout_id}`,
       { reaction_type },
       { headers: this.getHeaders() }
    );
    return res.data;
  }

  async getReactionCounts(shoutout_id) {
    const res = await axios.get(`${API_BASE_URL}/reactions/${shoutout_id}`, {
      headers: this.getHeaders()
    });
    return res.data;
  }
  
  async getReactedUsers(shoutout_id) {
    const res = await axios.get(
      `${API_BASE_URL}/reactions/${shoutout_id}/users`,
      { headers: this.getHeaders() }
    );
    return res.data;
  }
  
  // -------------------- COMMENTS --------------------
  async addComment(shoutout_id, { user_id, text }) {
    const res = await axios.post(
      `${API_BASE_URL}/shoutouts/${shoutout_id}/comments`,
      { user_id, text },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async deleteComment(comment_id) {
    const res = await axios.delete(`${API_BASE_URL}/shoutouts/comments/${comment_id}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async updateComment(shoutout_id, comment_id, { text }) {
    const res = await axios.put(
      `${API_BASE_URL}/shoutouts/${shoutout_id}/comments/${comment_id}`,
      { text },
      { headers: this.getHeaders() }
    );
    return res.data;
  }
    
  // -------------------- UPDATING SHOUTOUT --------------------
  async updateShoutout(shoutout_id, data) {
    const res = await axios.put(`${API_BASE_URL}/shoutouts/${shoutout_id}`, data, {
      headers: this.getHeaders(),
    });
    return res.data;
  }
  
  // -------------------- DELETE SHOUTOUT --------------------
  async deleteShoutout(shoutout_id) {
    const res = await axios.delete(`${API_BASE_URL}/shoutouts/${shoutout_id}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  // -------------------- DASHBOARD --------------------
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/shoutouts/dashboard/stats`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to fetch dashboard stats");
    return await res.json();
  }

// -------------------- UPDATE USER ACCOUNT --------------------
async updateUser(userId, updatedData) {
  const res = await axios.put(`${API_BASE_URL}/users/${userId}`, updatedData, {
    headers: {
      Authorization: `Bearer ${this.getToken()}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}


  // -------------------- DELETE USER ACCOUNT --------------------
  async deleteUser(userId) {
    // deleting user account
    const res = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    return res.data;
  }
}

export default new ApiService();
