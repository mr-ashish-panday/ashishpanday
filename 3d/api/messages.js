import { getMessagesPayload } from "../server/lib/api-service.js";
import { handleApiError, jsonResponse, methodNotAllowed } from "./_utils.js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return methodNotAllowed("GET");
  }

  try {
    return jsonResponse(await getMessagesPayload());
  } catch (error) {
    return handleApiError(error);
  }
}
