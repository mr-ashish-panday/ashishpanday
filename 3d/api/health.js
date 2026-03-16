import { getHealthPayload } from "../server/lib/api-service.js";
import { handleApiError, jsonResponse } from "./_utils.js";

export async function GET(request) {
  void request;

  try {
    return jsonResponse(await getHealthPayload());
  } catch (error) {
    return handleApiError(error);
  }
}
