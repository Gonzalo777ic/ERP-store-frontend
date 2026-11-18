import axios from "axios";
import { http } from "@/api/http";

export interface CodedOption {
  code: string;
  label: string;
  description: string;
}

export interface DocumentOption {
  code: string;
  label: string;
  minLength: number;
  maxLength: number;
}

export interface ComplaintCatalog {
  kinds: CodedOption[];
  documentTypes: DocumentOption[];
  subjectKinds: CodedOption[];
  statuses: CodedOption[];
}

export interface ComplaintDraft {
  fullName: string;
  documentType: string;
  documentNumber: string;
  address: string;
  phone: string;
  email: string;
  minor: boolean;
  guardianName: string;
  guardianDocumentType: string;
  guardianDocumentNumber: string;
  subjectKind: string;
  subjectDescription: string;
  claimedAmount: string;
  orderReference: string;
  kind: string;
  detail: string;
  consumerRequest: string;
}

export interface FiledComplaint {
  id: number;
  sheetNumber: string;
  filedAt: string;
  consumerName: string;
  kindLabel: string;
  statusLabel: string;
}

const COMPLAINTS_PATH = "/store/complaints";

export function emptyComplaintDraft(): ComplaintDraft {
  return {
    fullName: "",
    documentType: "",
    documentNumber: "",
    address: "",
    phone: "",
    email: "",
    minor: false,
    guardianName: "",
    guardianDocumentType: "",
    guardianDocumentNumber: "",
    subjectKind: "",
    subjectDescription: "",
    claimedAmount: "",
    orderReference: "",
    kind: "",
    detail: "",
    consumerRequest: "",
  };
}

export async function fetchComplaintCatalog(): Promise<ComplaintCatalog> {
  const response = await http.get<ComplaintCatalog>(`${COMPLAINTS_PATH}/catalog`);
  return response.data;
}

export async function fileComplaint(draft: ComplaintDraft, accessToken?: string): Promise<FiledComplaint> {
  const command = toCommand(draft);
  try {
    return await postSheet(command, accessToken);
  } catch (error) {
    if (accessToken && isUnauthorized(error)) {
      return postSheet(command, undefined);
    }
    throw error;
  }
}

export function complaintErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

async function postSheet(command: ReturnType<typeof toCommand>, accessToken?: string): Promise<FiledComplaint> {
  const response = await http.post<FiledComplaint>(COMPLAINTS_PATH, command, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  return response.data;
}

function toCommand(draft: ComplaintDraft) {
  return {
    fullName: draft.fullName,
    documentType: draft.documentType,
    documentNumber: draft.documentNumber,
    address: draft.address,
    phone: draft.phone,
    email: draft.email,
    minor: draft.minor,
    guardianName: draft.minor ? emptyToNull(draft.guardianName) : null,
    guardianDocumentType: draft.minor ? emptyToNull(draft.guardianDocumentType) : null,
    guardianDocumentNumber: draft.minor ? emptyToNull(draft.guardianDocumentNumber) : null,
    subjectKind: draft.subjectKind,
    subjectDescription: draft.subjectDescription,
    claimedAmount: normalizeAmount(draft.claimedAmount),
    orderReference: emptyToNull(draft.orderReference),
    kind: draft.kind,
    detail: draft.detail,
    consumerRequest: draft.consumerRequest,
  };
}

function normalizeAmount(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("El monto reclamado admite como máximo dos decimales");
  }
  return normalized;
}

function emptyToNull(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}

function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
