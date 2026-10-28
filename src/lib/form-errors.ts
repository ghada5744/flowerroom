import { ZodError } from "zod";

const FIELD_LABELS: Record<string, string> = {
  senderName: "Your name",
  senderEmail: "Email",
  senderPhone: "Phone",
  recipientName: "Recipient name",
  recipientPhone: "Recipient phone",
  deliveryAddress: "Delivery address",
  deliveryCity: "City",
  deliveryDate: "Delivery date",
  giftMessage: "Gift message",
  name: "Name",
  email: "Email",
  phone: "Phone",
  password: "Password",
  items: "Cart",
};

function labelFor(path: string) {
  return FIELD_LABELS[path] || path;
}

function messageForIssue(path: string, issue: { code: string; message: string }) {
  const label = labelFor(path);
  if (issue.message && !/expected string|too_small|too_big|invalid_type|invalid_format/i.test(issue.message)) {
    return issue.message;
  }
  switch (issue.code) {
    case "too_small":
      if (path === "deliveryAddress") return "Please enter a fuller delivery address.";
      if (path === "password") return "Password must be at least 6 characters.";
      if (path.includes("Phone") || path === "phone" || path === "senderPhone" || path === "recipientPhone") {
        return `Please enter a valid ${label.toLowerCase()}.`;
      }
      return `Please complete the ${label.toLowerCase()} field.`;
    case "invalid_string":
    case "invalid_format":
      if (path.toLowerCase().includes("email") || path === "email" || path === "senderEmail") {
        return "Please enter a valid email address.";
      }
      return `Please check the ${label.toLowerCase()} field.`;
    default:
      return `Please check the ${label.toLowerCase()} field.`;
  }
}

export type FieldErrors = Record<string, string>;

export function formatZodError(err: ZodError): { error: string; fields: FieldErrors } {
  const fields: FieldErrors = {};
  for (const issue of err.issues) {
    const path = issue.path.filter((p) => typeof p === "string" || typeof p === "number").join(".");
    const key = String(issue.path[0] ?? "form");
    if (!fields[key]) {
      fields[key] = messageForIssue(key, issue);
    }
    void path;
  }
  const first = Object.values(fields)[0] || "Please check the form and try again.";
  return { error: first, fields };
}

export function apiErrorFromUnknown(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (err instanceof ZodError) {
    const formatted = formatZodError(err);
    return { status: 400 as const, body: formatted };
  }
  if (err instanceof Error && err.message && !/\[ \{/.test(err.message)) {
    return { status: 400 as const, body: { error: err.message, fields: {} as FieldErrors } };
  }
  return { status: 400 as const, body: { error: fallback, fields: {} as FieldErrors } };
}
