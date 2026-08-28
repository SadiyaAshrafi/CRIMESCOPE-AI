const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// Cases
export const getCases = () => apiRequest("/cases");

export const getCase = (caseId) =>
  apiRequest(`/cases/${caseId}`);

export const getCaseNetwork = (caseId) =>
  apiRequest(`/cases/${caseId}/network`);

export const getRelatedCases = (caseId) =>
  apiRequest(`/cases/${caseId}/related`);

// Entities
export const getEntity = (entityId) =>
  apiRequest(`/entities/${entityId}`);

// Network intelligence
export const getNetworkDNA = () =>
  apiRequest("/network/dna");

export const getNetworkEvolution = () =>
  apiRequest("/network/evolution");

// Relationships
export const getRelationship = (relationshipId) =>
  apiRequest(`/relationships/${relationshipId}`);

// Evidence
export const getEvidence = (evidenceId) =>
  apiRequest(`/evidence/${evidenceId}`);

export default {
  getCases,
  getCase,
  getCaseNetwork,
  getRelatedCases,
  getEntity,
  getNetworkDNA,
  getNetworkEvolution,
  getRelationship,
  getEvidence,
};