const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function getIntegrationData() {
  const response = await fetch(`${API_BASE_URL}/integration-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Integration API failed with status ${response.status}`
    );
  }

  const data = await response.json();

  if (data.status && data.status !== "success") {
    throw new Error("Integration API returned an unsuccessful response");
  }

  return data;
}

export async function getCaseNetwork(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${encodeURIComponent(caseId)}/network`
  );

  if (!response.ok) {
    throw new Error(
      `Case network API failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function getRelatedCases(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${encodeURIComponent(caseId)}/related`
  );

  if (!response.ok) {
    throw new Error(
      `Related cases API failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function getIndirectConnections(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${encodeURIComponent(caseId)}/indirect`
  );

  if (!response.ok) {
    throw new Error(
      `Indirect connections API failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function getNetworkDNA() {
  const response = await fetch(`${API_BASE_URL}/network/dna`);

  if (!response.ok) {
    throw new Error(
      `Network DNA API failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function getNetworkEvolution(fromDate, toDate) {
  const params = new URLSearchParams({
    from_date: fromDate,
    to_date: toDate,
  });

  const response = await fetch(
    `${API_BASE_URL}/network/evolution?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Network evolution API failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function getIntelligenceSummary() {
  const response = await fetch(
    `${API_BASE_URL}/intelligence-summary`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Intelligence Summary API failed with status ${response.status}`
    );
  }

  const data = await response.json();

  if (data.status && data.status !== "success") {
    throw new Error(
      "Intelligence Summary API returned an unsuccessful response"
    );
  }

  return data;
}
