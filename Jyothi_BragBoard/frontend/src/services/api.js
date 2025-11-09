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
// --------------------- COMMENTS -------------------------
async getComments(shoutoutId) {
  const res = await fetch(`${API_BASE_URL}/comments/${shoutoutId}`, {
    headers: this.getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

async addComment(shoutoutId, content) {
  const res = await fetch(`${API_BASE_URL}/comments/${shoutoutId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...this.getHeaders(),
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}

async deleteComment(comment_id) {
  const res = await fetch(`${API_BASE_URL}/comments/${comment_id}`, {
    method: "DELETE",
    headers: this.getHeaders(),
  });
  return res.json();
}

async updateComment(commentId, content) {
  return fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...this.getHeaders(),
    },
    body: JSON.stringify({ content }),
  }).then((res) => res.json());
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


  // -------------------- ADMIN DASHBOARD --------------------

  async getAdminStats() {
    const res = await axios.get(`${API_BASE_URL}/admin/stats`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }  
 
  async getTopContributors() {
    const res = await axios.get(`${API_BASE_URL}/admin/top-contributors`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getMostTagged() {
    const res = await axios.get(`${API_BASE_URL}/admin/most-tagged`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

async getTopDepartments(limit = 8) {
  const res = await axios.get(`${API_BASE_URL}/admin/top-departments?limit=${limit}`, {
    headers: this.getHeaders(),
  });
  return res.data;
}

async getActivityTrend(days = 30) {
  const res = await axios.get(`${API_BASE_URL}/admin/activity-trend?days=${days}`, {
    headers: this.getHeaders(),
  });
  return res.data;
}

  // -------------------- REPORT MANAGEMENT --------------------
  async reportShoutout(shoutout_id, reason) {
    const res = await axios.post(
      `${API_BASE_URL}/shoutouts/report/${shoutout_id}?reason=${encodeURIComponent(reason)}`,
      {}, // Empty body
      { headers: this.getHeaders() }
    );
    return res.data;
  }
  
  

async getReports(filter = "all") {
  const res = await axios.get(
    `${API_BASE_URL}/admin/reports?filter=${filter}`,
    { headers: this.getHeaders() }
  );
  return res.data;
}


async resolveReport(report_id) {
  const res = await axios.post(
    `${API_BASE_URL}/admin/reports/${report_id}/resolve`,
    {},
    { headers: this.getHeaders() }
  );
  return res.data;
}

async getShoutout(shoutout_id) {
  const res = await axios.get(
    `${API_BASE_URL}/shoutouts/${shoutout_id}`,
    { headers: this.getHeaders() }
  );
  return res.data;
}

// -------------------- ADMIN ACTIONS --------------------
async adminDeleteShoutout(shoutout_id) {
  const res = await axios.delete(
    `${API_BASE_URL}/admin/shoutout/${shoutout_id}/admin-delete`,
    { headers: this.getHeaders() }
  );
  return res.data;
}

async adminDeleteComment(comment_id) {
  const res = await axios.delete(
    `${API_BASE_URL}/admin/comment/${comment_id}`,
    { headers: this.getHeaders() }
  );
  return res.data;
}


// -------------------- EXPORT REPORTS --------------------
async exportShoutoutsCSV() {
  const res = await fetch(`${API_BASE_URL}/admin/export/shoutouts/csv`, {
    headers: this.getHeaders(),
  });

  if (!res.ok) throw new Error("Failed to export CSV");
  return res.blob(); // return blob for download
}

async exportShoutoutsPDF() {
  const res = await fetch(`${API_BASE_URL}/admin/export/shoutouts/pdf`, {
    headers: this.getHeaders(),
  });

  if (!res.ok) throw new Error("Failed to export PDF");
  return res.blob(); // return blob for download
}

// -------------------- ACHIEVEMENTS --------------------
async getAchievements() {
  const res = await fetch(`${API_BASE_URL}/achievements/`, {
    headers: this.getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch achievements");
  return await res.json();
}

// -------------------- LEADERBOARD --------------------
async getLeaderboard(top_n = 10) {
  const res = await fetch(`${API_BASE_URL}/achievements/leaderboard?top_n=${top_n}`, {
    headers: this.getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return await res.json();
}

}
export default new ApiService();
