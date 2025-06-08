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

/**
 * Demande l'envoi d'un email de réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<Object>} - Confirmation de l'envoi de l'email
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur de demande de réinitialisation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    throw error;
  }
};

/**
 * Vérifie la validité d'un token de réinitialisation de mot de passe
 * @param {string} token - Token de réinitialisation
 * @returns {Promise<boolean>} - Indique si le token est valide
 */
export const verifyResetToken = async (token) => {
  try {
    const response = await fetch(`${API_URL}/verify-reset-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return false;
  }
};

/**
 * Réinitialise le mot de passe avec un token valide
 * @param {string} token - Token de réinitialisation
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Promise<Object>} - Confirmation de la réinitialisation
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token, 
        new_password: newPassword 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur de réinitialisation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    throw error;
  }
};

