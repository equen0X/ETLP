const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const SERVICE_ACCOUNT_FILE =
  process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
  path.join(__dirname, "..", "constant-autumn-469609-a7-13ca40fd8adf.json");

function getDriveClient() {
  // Support either a direct JSON string in GOOGLE_SERVICE_ACCOUNT_KEY
  // or a base64-encoded JSON in GOOGLE_SERVICE_ACCOUNT_KEY_B64 to avoid newline escaping issues.
  let keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const keyB64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64;

  if (!keyJson && keyB64) {
    try {
      keyJson = Buffer.from(keyB64, "base64").toString("utf8");
    } catch (e) {
      console.error("Failed to decode GOOGLE_SERVICE_ACCOUNT_KEY_B64", e.message);
      return null;
    }
  }

  if (!keyJson && fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    try {
      keyJson = fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf8");
    } catch (e) {
      console.error("Failed to read Google service account file", e.message);
      return null;
    }
  }

  if (!keyJson) return null;

  let key;
  try {
    key = typeof keyJson === "string" ? JSON.parse(keyJson) : keyJson;
  } catch (e) {
    console.error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON", e.message);
    return null;
  }

const privateKey = key.private_key.replace(/\\n/g, "\n");

const auth = new google.auth.JWT({
  email: key.client_email,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"]
});

return google.drive({ version: "v3", auth });
}

exports.listFilesSA = async (req, res) => {
  const { folderId } = req.query;
  if (!folderId) {
    return res.status(400).json({ success: false, message: "folderId is required" });
  }

  const drive = getDriveClient();
  if (!drive) {
    return res.status(500).json({ success: false, message: "Service account not configured" });
  }

  try {
    const q = `'${folderId}' in parents and trashed=false`;
    const response = await drive.files.list({
      q,
      fields: "files(id,name,mimeType,thumbnailLink,webViewLink)",
      pageSize: 200
    });

    const files = response.data.files || [];
    return res.status(200).json({ success: true, files });
  } catch (error) {
    console.error("Drive SA list error", error?.message || error);
    return res.status(500).json({ success: false, message: "Failed to list Drive files via service account" });
  }
};

exports.streamFileSA = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: "file id required" });

  const drive = getDriveClient();
  if (!drive) {
    return res.status(500).json({ success: false, message: "Service account not configured" });
  }

  try {
    // first get metadata to learn mimeType
    const meta = await drive.files.get({ fileId: id, fields: "id,name,mimeType" });
    const mimeType = meta.data.mimeType || "application/octet-stream";
    // Forward Range header (if present) so Drive can return partial content for seeking
    const range = req.headers.range;
    const requestOpts = { responseType: "stream" };
    if (range) {
      requestOpts.headers = { Range: range };
    }

    const r = await drive.files.get({ fileId: id, alt: "media" }, requestOpts);

    // Set Content-Type and forward relevant headers for partial content.
    // gaxios may expose response headers as a WHATWG Headers instance rather
    // than a plain object, so support both access styles.
    res.setHeader("Content-Type", mimeType);
    try {
      const upstreamHeaders = r.headers || (r.data && r.data.headers) || {};
      const getHeader = (name) => {
        if (typeof upstreamHeaders.get === "function") {
          return upstreamHeaders.get(name);
        }
        return upstreamHeaders[name] || upstreamHeaders[name.toLowerCase()];
      };
      const contentRange = getHeader("content-range");
      const acceptRanges = getHeader("accept-ranges") || "bytes";
      const contentLength = getHeader("content-length");

      if (contentRange) res.setHeader("Content-Range", contentRange);
      if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);
      if (contentLength) res.setHeader("Content-Length", contentLength);
      // If Drive returned 206 Partial Content, mirror that status
      if (r.status === 206) {
        res.status(206);
      }
    } catch (e) {
      // ignore header forwarding errors
    }

    // Pipe stream to response
    r.data.pipe(res);
  } catch (error) {
    console.error("Drive SA stream error", error?.message || error);
    return res.status(500).json({ success: false, message: "Failed to stream Drive file via service account" });
  }
};

exports.status = (req, res) => {
  const drive = getDriveClient();
  if (!drive) {
    return res.status(200).json({ success: true, enabled: false });
  }
  return res.status(200).json({ success: true, enabled: true });
};
