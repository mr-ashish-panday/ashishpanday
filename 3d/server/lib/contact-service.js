import { randomUUID } from "node:crypto";

export const validateMessage = (payload = {}) => {
  const errors = {};

  if (!payload.name || payload.name.trim().length < 2) {
    errors.name = "Please enter your name.";
  }

  const email = payload.email?.trim();
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!payload.subject || payload.subject.trim().length < 3) {
    errors.subject = "Please add a short subject.";
  }

  if (!payload.message || payload.message.trim().length < 10) {
    errors.message = "Please write at least 10 characters.";
  }

  return errors;
};

export const sanitizeMessage = (message) => ({
  id: randomUUID(),
  name: message.name.trim(),
  email: message.email.trim().toLowerCase(),
  subject: message.subject.trim(),
  message: message.message.trim(),
  submittedAt: new Date().toISOString(),
});
