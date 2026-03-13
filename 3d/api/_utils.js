import { ApiError } from "../server/lib/api-error.js";

export const jsonResponse = (payload, status = 200, headers = {}) =>
  Response.json(payload, {
    status,
    headers,
  });

export const methodNotAllowed = (allowedMethod) =>
  jsonResponse(
    {
      message: `Method not allowed. Use ${allowedMethod}.`,
    },
    405,
    {
      Allow: allowedMethod,
    }
  );

export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    return jsonResponse(
      {
        message: error.message,
        ...(Object.keys(error.details).length > 0
          ? { errors: error.details }
          : {}),
      },
      error.status
    );
  }

  console.error(error);

  return jsonResponse(
    {
      message: "Something went wrong on the server.",
    },
    500
  );
};
