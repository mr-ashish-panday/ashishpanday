import { ApiError } from "./api-error.js";
import { sanitizeMessage, validateMessage } from "./contact-service.js";
import {
  getStorageMode,
  listStoredMessages,
  saveStoredMessage,
} from "./messages-store.js";
import { getPortfolioData } from "./portfolio-store.js";

export const getHealthPayload = async () => {
  const [portfolio, submissions] = await Promise.all([
    getPortfolioData(),
    listStoredMessages(),
  ]);

  return {
    status: "ok",
    project: portfolio.profile?.name || "Portfolio API",
    submissions: submissions.length,
    storageMode: getStorageMode(),
    checkedAt: new Date().toISOString(),
  };
};

export const getPortfolioPayload = async () => getPortfolioData();

export const getMessagesPayload = async () => {
  const submissions = await listStoredMessages();

  return {
    total: submissions.length,
    storageMode: getStorageMode(),
    submissions,
  };
};

export const submitContactPayload = async (payload = {}) => {
  const errors = validateMessage(payload);

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, "Please fix the highlighted fields.", errors);
  }

  const submission = sanitizeMessage(payload);
  await saveStoredMessage(submission);

  return {
    message: "Message received successfully.",
    submission,
  };
};
