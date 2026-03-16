import { getPortfolioPayload } from "../3d/server/lib/api-service.js";
import { handleApiError, jsonResponse } from "./_utils.js";

export async function GET(request) {
  void request;

  try {
    return jsonResponse(await getPortfolioPayload());
  } catch (error) {
    return handleApiError(error);
  }
}
