const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
// In browser development, if VITE_API_URL is omitted, use relative '/api' (proxied by Vite)
export const API_BASE = rawApiUrl ? `${rawApiUrl.replace(/\/+$/, '')}/api` : '/api';

export function getAuthToken() {
  try {
    const raw = localStorage.getItem('legal_ai_token');
    if (raw) return raw;
    const userRaw = localStorage.getItem('legal_ai_user');
    if (userRaw) {
      const parsed = JSON.parse(userRaw);
      return parsed.access_token || parsed.token || null;
    }
  } catch (e) {}
  return null;
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Resilient HTTP fetcher with configurable timeout and meaningful error translation.
 * Avoids cryptic "Failed to fetch" or generic "Something went wrong" messages.
 */
export async function safeFetch(url, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out while waiting for server response. Please try again.');
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You appear to be offline. Please check your internet connection.');
    }

    const targetHint = API_BASE.startsWith('http') ? API_BASE : 'the backend server';
    throw new Error(`Unable to connect to the legal AI service. Please ensure ${targetHint} is running and reachable.`);
  }
}

export async function checkHealth() {
  // Free tier Render instances sleep after 15 min and take 15-45s to wake up on the first request
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await safeFetch(`${API_BASE}/health`, {}, attempt === 0 ? 15000 : 35000);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          status: 'error',
          database_connected: false,
          detail: errData.error_message || errData.detail || `Server responded with status ${res.status}`
        };
      }
      return await res.json();
    } catch (err) {
      if (attempt === 1) {
        return {
          status: 'error',
          database_connected: false,
          detail: err.message || 'Unable to connect to backend server'
        };
      }
      // Brief pause before wake-up retry
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

export async function uploadDocument(file = null, useSample = false, userId = null) {
  const formData = new FormData();
  if (useSample || !file) {
    formData.append('use_sample', 'true');
  } else {
    formData.append('file', file);
    formData.append('use_sample', 'false');
  }
  if (userId) {
    formData.append('user_id', userId);
  }

  const res = await safeFetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  }, 90000); // Allow 90s for deep contract analysis, cold starts & Gemini processing

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 413) {
      throw new Error('Contract file size exceeds the 25MB limit. Please upload a smaller PDF.');
    }
    if (res.status === 400) {
      throw new Error(errorData.detail || 'Invalid PDF format or empty document.');
    }
    throw new Error(errorData.detail || `Upload failed with status code ${res.status}`);
  }

  return await res.json();
}

export async function getDocuments(userId = null, limit = 50, offset = 0) {
  const params = new URLSearchParams();
  if (userId) params.set('user_id', userId);
  if (limit) params.set('limit', limit);
  if (offset) params.set('offset', offset);
  const queryStr = params.toString() ? `?${params.toString()}` : '';

  const res = await safeFetch(`${API_BASE}/documents${queryStr}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to load your contract history.');
  }
  const data = await res.json();
  return data.documents || [];
}

export async function getDocumentDetails(documentId) {
  const res = await safeFetch(`${API_BASE}/documents/${documentId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Contract not found or may have been deleted.');
    }
    if (res.status === 403) {
      throw new Error('Access denied: You do not have permission to view this document.');
    }
    throw new Error(`Failed to load contract details (${res.status})`);
  }
  return await res.json();
}

export async function getDocumentAnalysis(documentId) {
  const res = await safeFetch(`${API_BASE}/documents/${documentId}/analysis`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Contract legal analysis is unavailable.');
  return await res.json();
}

export async function deleteDocument(documentId) {
  const res = await safeFetch(`${API_BASE}/documents/${documentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to delete contract from history.');
  }
  return await res.json();
}

export async function askQuestion(documentId, question) {
  const res = await safeFetch(`${API_BASE}/documents/${documentId}/chat`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      question: question.trim(),
    }),
  }, 35000); // 35s timeout for complex multi-page RAG

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 404) {
      throw new Error('Document session expired or not found. Please refresh the page.');
    }
    if (res.status === 429) {
      throw new Error('AI rate limit reached. Please wait a few seconds and ask again.');
    }
    throw new Error(errorData.detail || 'Unable to retrieve AI answer for this clause.');
  }

  return await res.json();
}

export const askRagQuestion = askQuestion;

export async function getChatHistory(documentId, limit = 100, offset = 0) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (offset) params.set('offset', offset);
  const queryStr = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(`${API_BASE}/documents/${documentId}/chat${queryStr}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to load chat history');
  const data = await res.json();
  return data.messages || [];
}

export async function clearChatHistory(documentId) {
  const res = await fetch(`${API_BASE}/documents/${documentId}/chat`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to clear chat history');
  return await res.json();
}

export async function compareDocuments(doc1Id, doc2Id) {
  const res = await safeFetch(`${API_BASE}/documents/compare`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      doc1_id: doc1Id,
      doc2_id: doc2Id,
    }),
  }, 40000);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to compare documents');
  }

  return await res.json();
}

export async function registerUserApi(email, password, fullName = null) {
  const res = await safeFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName
    })
  }, 15000);
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    throw new Error(`Server returned status ${res.status}. Please check your backend connection.`);
  }
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to create account');
  }
  return data;
}

export async function loginUserApi(email, password) {
  const res = await safeFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password
    })
  }, 15000);
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    throw new Error(`Server returned status ${res.status}. Please check your backend connection.`);
  }
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to sign in. Please verify your credentials.');
  }
  return data;
}

export async function checkUserSession(userId) {
  try {
    const res = await safeFetch(`${API_BASE}/auth/user/${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    }, 6000);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    return null;
  }
}

export async function deleteUserAccount(userId) {
  const res = await safeFetch(`${API_BASE}/auth/user/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }, 15000);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete user account');
  }
  return await res.json();
}


