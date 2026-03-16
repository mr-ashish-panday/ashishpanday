import { get, list, put } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { ApiError } from "./api-error.js";

const messagesFile = new URL("../data/messages.json", import.meta.url);
const messagesDir = path.dirname(fileURLToPath(messagesFile));
const blobPrefix = "contact-messages/";

const createBlobConfigError = (error) =>
  new ApiError(
    503,
    "Blob storage failed. Connect a Private Blob store to this Vercel project, make sure BLOB_READ_WRITE_TOKEN points to it, and redeploy.",
    error?.message ? { storage: error.message } : {}
  );

const readLocalMessages = async () => {
  try {
    const content = await fs.readFile(messagesFile, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
};

const writeLocalMessages = async (messages) => {
  await fs.mkdir(messagesDir, { recursive: true });
  await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
};

const isBlobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const isVercelDeployment = () =>
  Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_URL);

export const getStorageMode = () => {
  if (isBlobConfigured()) {
    return "vercel-blob";
  }

  if (isVercelDeployment()) {
    return "missing-vercel-blob";
  }

  return "local-file";
};

const blobPathForMessage = (message) => {
  const safeTimestamp = message.submittedAt
    .replaceAll(":", "-")
    .replaceAll(".", "-");

  return `${blobPrefix}${safeTimestamp}-${message.id}.json`;
};

const parseBlobJson = async (pathname) => {
  let blob;

  try {
    blob = await get(pathname, { access: "private" });
  } catch (error) {
    throw createBlobConfigError(error);
  }

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return null;
  }

  return JSON.parse(await new Response(blob.stream).text());
};

const upsertLocalMessage = async (message) => {
  const submissions = await readLocalMessages();
  const index = submissions.findIndex((entry) => entry.id === message.id);

  if (index >= 0) {
    submissions[index] = message;
  } else {
    submissions.unshift(message);
  }

  await writeLocalMessages(submissions);
};

export const listStoredMessages = async () => {
  const storageMode = getStorageMode();

  if (storageMode === "vercel-blob") {
    try {
      const result = await list({ prefix: blobPrefix });
      const orderedBlobs = [...result.blobs].sort((a, b) =>
        b.pathname.localeCompare(a.pathname)
      );

      const messages = await Promise.all(
        orderedBlobs.map((blob) => parseBlobJson(blob.pathname))
      );

      return messages.filter(Boolean);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw createBlobConfigError(error);
    }
  }

  if (storageMode === "missing-vercel-blob") {
    return [];
  }

  return readLocalMessages();
};

export const saveStoredMessage = async (message) => {
  const storageMode = getStorageMode();

  if (storageMode === "vercel-blob") {
    try {
      await put(blobPathForMessage(message), JSON.stringify(message, null, 2), {
        access: "private",
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: "application/json",
      });
    } catch (error) {
      throw createBlobConfigError(error);
    }
    return;
  }

  if (storageMode === "missing-vercel-blob") {
    throw new ApiError(
      503,
      "Vercel Blob is not configured. Connect a Blob store in Vercel and redeploy."
    );
  }

  await upsertLocalMessage(message);
};

export const updateStoredMessage = async (message) => {
  const storageMode = getStorageMode();

  if (storageMode === "vercel-blob") {
    try {
      await put(blobPathForMessage(message), JSON.stringify(message, null, 2), {
        access: "private",
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: "application/json",
      });
    } catch (error) {
      throw createBlobConfigError(error);
    }
    return;
  }

  if (storageMode === "missing-vercel-blob") {
    throw new ApiError(
      503,
      "Vercel Blob is not configured. Connect a Blob store in Vercel and redeploy."
    );
  }

  await upsertLocalMessage(message);
};
