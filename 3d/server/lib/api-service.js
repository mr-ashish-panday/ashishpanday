import { ApiError } from "./api-error.js";
import { sanitizeMessage, validateMessage } from "./contact-service.js";
import { getEmailMode, sendContactEmails } from "./email-service.js";
import {
  getStorageMode,
  listStoredMessages,
  saveStoredMessage,
  updateStoredMessage,
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
    emailMode: getEmailMode(),
    checkedAt: new Date().toISOString(),
  };
};

export const getPortfolioPayload = async () => getPortfolioData();

export const getMessagesPayload = async () => {
  const submissions = await listStoredMessages();

  return {
    total: submissions.length,
    storageMode: getStorageMode(),
    emailMode: getEmailMode(),
    submissions,
  };
};

export const submitContactPayload = async (payload = {}) => {
  const portfolio = await getPortfolioData();
  const errors = validateMessage(payload);

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, "Please fix the highlighted fields.", errors);
  }

  let submission = {
    ...sanitizeMessage(payload),
    notifications: {
      ownerEmail: { status: "pending" },
      autoReply: { status: "pending" },
    },
  };

  await saveStoredMessage(submission);

  try {
    const emailResult = await sendContactEmails(submission, portfolio);

    submission = {
      ...submission,
      notifications: {
        ownerEmail: emailResult.ownerNotification,
        autoReply: emailResult.autoReply,
      },
    };

    await updateStoredMessage(submission);
  } catch (error) {
    submission = {
      ...submission,
      notifications: {
        ownerEmail: {
          status: "failed",
          error: error.message,
        },
        autoReply: {
          status: "skipped",
        },
      },
    };

    await updateStoredMessage(submission);
    throw error;
  }

  return {
    message: "Message received successfully. We will get back to you soon.",
    submission,
  };
};
