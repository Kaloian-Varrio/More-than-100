export function createAuthAdmin(url, secretKey) {
  const request = async (path, options = {}) => {
    let response;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      response = await fetch(`${url}/auth/v1/admin${path}`, {
        ...options,
        headers: {
          apikey: secretKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (response.status !== 403) break;
      const errorBody = await response.clone().json().catch(() => ({}));
      if (errorBody?.error_code !== 'bad_jwt' && errorBody?.code !== 'bad_jwt') break;
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
    const body = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      const error = new Error(body?.msg || body?.message || body?.error || `Auth Admin request failed with ${response.status}.`);
      error.status = response.status;
      throw error;
    }
    return body;
  };

  return {
    async createUser(attributes) {
      return request('/users', { method: 'POST', body: JSON.stringify(attributes) });
    },
    async deleteUser(userId) {
      return request(`/users/${userId}`, { method: 'DELETE' });
    },
  };
}
