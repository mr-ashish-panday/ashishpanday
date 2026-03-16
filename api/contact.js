import { submitContactPayload } from "../3d/server/lib/api-service.js";
import { handleApiError, jsonResponse } from "./_utils.js";

export async function POST(request) {
  try {
    return jsonResponse(await submitContactPayload(await request.json()), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
