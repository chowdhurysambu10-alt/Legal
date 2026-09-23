const API_BASE = '/api';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
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
    console.error('API health check error:', err);
    return {
      status: 'error',
      database_connected: false,
      detail: err.message || 'Unable to connect to backend server'
    };
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

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
  }

  return await res.json();
}

export async function getDocuments(userId = null) {
  const url = userId ? `${API_BASE}/documents?user_id=${encodeURIComponent(userId)}` : `${API_BASE}/documents`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch documents');
  const data = await res.json();
  return data.documents || [];
}

export async function getDocumentDetails(documentId) {
  const res = await fetch(`${API_BASE}/documents/${documentId}`);
  if (!res.ok) throw new Error(`Failed to fetch document ${documentId}`);
  return await res.json();
}

export async function getDocumentAnalysis(documentId) {
  const res = await fetch(`${API_BASE}/documents/${documentId}/analysis`);
  if (!res.ok) throw new Error(`Failed to fetch analysis for ${documentId}`);
  return await res.json();
}

export async function deleteDocument(documentId) {
  const res = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete document');
  return await res.json();
}

export async function askQuestion(documentId, question) {
  const res = await fetch(`${API_BASE}/documents/${documentId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: question.trim(),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get answer');
  }

  return await res.json();
}

export const askRagQuestion = askQuestion;

export async function getChatHistory(documentId) {
  const res = await fetch(`${API_BASE}/documents/${documentId}/chat`);
  if (!res.ok) throw new Error('Failed to load chat history');
  const data = await res.json();
  return data.messages || [];
}

export async function clearChatHistory(documentId) {
  const res = await fetch(`${API_BASE}/documents/${documentId}/chat`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear chat history');
  return await res.json();
}

export async function compareDocuments(doc1Id, doc2Id) {
  const res = await fetch(`${API_BASE}/documents/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      doc1_id: doc1Id,
      doc2_id: doc2Id,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to compare documents');
  }

  return await res.json();
}

export async function registerUserApi(email, password, fullName = null) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to create account');
  }
  return data;
}

export async function loginUserApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to sign in');
  }
  return data;
}

export async function checkUserSession(userId) {
  try {
    const res = await fetch(`${API_BASE}/auth/user/${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    return null;
  }
}

export async function deleteUserAccount(userId) {
  const res = await fetch(`${API_BASE}/auth/user/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete user account');
  }
  return await res.json();
}


