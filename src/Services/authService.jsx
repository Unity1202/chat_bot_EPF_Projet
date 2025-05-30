const API_URL = 'http://localhost:8000/api/auth';

/**
 * Authentifie un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {Promise<Object>} - Les informations de l'utilisateur connecté
 */
export const login = async (email, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: formData,
    });

    if (!loginRes.ok) {
      const errorData = await loginRes.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur d'authentification: ${loginRes.status}`);
    }

    // Récupérer l'utilisateur connecté
    const meRes = await fetch(`${API_URL}/me`, {
      credentials: 'include',
    });

    if (!meRes.ok) throw new Error("Impossible de récupérer les infos utilisateur");

    const userData = await meRes.json();
    return userData;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
};

/**
 * Inscrit un nouvel utilisateur
 */
export const signup = async (userData) => {
  try {
    const payload = {
      email: userData.email,
      username: userData.username || `${userData.firstName}_${userData.lastName}`.toLowerCase().replace(/\s+/g, '_'),
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
    };

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur d'inscription: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    throw error;
  }
};

/**
 * Récupère l'utilisateur connecté
 */
export const getCurrentUser = async () => {
  try {
    const res = await fetch(`${API_URL}/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};

/**
 * Déconnecte l'utilisateur
 */
export const logout = async () => {
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};

