// Temporary frontend data.
// This will later be replaced by Irfan's real API responses.

export const mockCases = [
  {
    id: "CASE-101",
    title: "Meridian Logistics Investigation",
    status: "ACTIVE",
    date: "2026-03-14",
    entityCount: 8,
    relationshipCount: 12,
  },
  {
    id: "CASE-102",
    title: "Eastern Network Investigation",
    status: "ACTIVE",
    date: "2026-04-02",
    entityCount: 6,
    relationshipCount: 9,
  },
  {
    id: "CASE-103",
    title: "Financial Network Investigation",
    status: "ACTIVE",
    date: "2026-05-18",
    entityCount: 7,
    relationshipCount: 11,
  },
  {
    id: "CASE-104",
    title: "Logistics Intelligence Case",
    status: "ACTIVE",
    date: "2026-06-03",
    entityCount: 4,
    relationshipCount: 6,
  },
  {
    id: "CASE-105",
    title: "Organization Network Case",
    status: "ACTIVE",
    date: "2026-06-21",
    entityCount: 2,
    relationshipCount: 5,
  },
];

export const mockEntities = [
  {
    id: "P-001",
    type: "PERSON",
    name: "Ravi Kumar",
  },
  {
    id: "P-002",
    type: "PERSON",
    name: "Arjun Mehta",
  },
  {
    id: "P-003",
    type: "PERSON",
    name: "Priya Sharma",
  },
  {
    id: "O-001",
    type: "ORGANIZATION",
    name: "Meridian Imports",
  },
  {
    id: "O-002",
    type: "ORGANIZATION",
    name: "Eastern Logistics",
  },
  {
    id: "L-001",
    type: "LOCATION",
    name: "Chennai",
  },
  {
    id: "L-002",
    type: "LOCATION",
    name: "Bengaluru",
  },
];

export const mockRelationships = [
  {
    id: "REL-001",
    source: "P-001",
    target: "O-001",
    type: "ASSOCIATED_WITH",
    confidence: 0.91,
    evidenceId: "EVD-001",
  },
  {
    id: "REL-002",
    source: "P-001",
    target: "O-002",
    type: "ASSOCIATED_WITH",
    confidence: 0.87,
    evidenceId: "EVD-002",
  },
  {
    id: "REL-003",
    source: "P-002",
    target: "O-001",
    type: "ASSOCIATED_WITH",
    confidence: 0.84,
    evidenceId: "EVD-003",
  },
  {
    id: "REL-004",
    source: "O-001",
    target: "L-001",
    type: "LOCATED_IN",
    confidence: 0.95,
    evidenceId: "EVD-004",
  },
];

export const mockEvidence = [
  {
    id: "EVD-001",
    relationshipId: "REL-001",
    document: "Case_101.pdf",
    page: 4,
    confidence: 0.91,
    extractedAt: "2026-03-15T10:42:00Z",
  },
  {
    id: "EVD-002",
    relationshipId: "REL-002",
    document: "Case_101.pdf",
    page: 7,
    confidence: 0.87,
    extractedAt: "2026-03-15T10:45:00Z",
  },
  {
    id: "EVD-003",
    relationshipId: "REL-003",
    document: "Case_103.pdf",
    page: 3,
    confidence: 0.84,
    extractedAt: "2026-05-19T09:20:00Z",
  },
  {
    id: "EVD-004",
    relationshipId: "REL-004",
    document: "Case_101.pdf",
    page: 5,
    confidence: 0.95,
    extractedAt: "2026-03-15T11:10:00Z",
  },
];

export const mockRelatedCases = [
  {
    caseId: "CASE-103",
    connectionScore: 84,
    reasons: [
      "Shared organization",
      "Shared person",
      "Location overlap",
      "Timeline overlap",
    ],
  },
];

export const mockNetworkDNA = {
  entities: 27,
  relationships: 43,
  cases: 5,
  organizations: 3,
  locations: 4,
  clusters: 3,
  crossCaseLinks: 8,
};

export const mockNetworkEvolution = [
  {
    date: "2026-01",
    entities: 18,
    relationships: 25,
    crossCaseLinks: 2,
  },
  {
    date: "2026-03",
    entities: 22,
    relationships: 31,
    crossCaseLinks: 4,
  },
  {
    date: "2026-06",
    entities: 27,
    relationships: 43,
    crossCaseLinks: 8,
  },
];