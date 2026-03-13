import { submitContactPayload } from "../server/lib/api-service.js";
import { handleApiError, jsonResponse, methodNotAllowed } from "./_utils.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return methodNotAllowed("POST");
  }

  try {
    return jsonResponse(await submitContactPayload(await request.json()), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
