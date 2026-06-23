const axios = require("axios");

exports.listFiles = async (req, res) => {
  const { folderId } = req.query;

  if (!folderId) {
    return res.status(400).json({ success: false, message: "folderId is required" });
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const q = `'${folderId}' in parents and trashed=false`;
    const fields = "files(id,name,mimeType,webViewLink,thumbnailLink)";

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=${encodeURIComponent("files(id,name,mimeType,webViewLink,thumbnailLink)")}&pageSize=200&key=${apiKey}`;

    const response = await axios.get(url);

    const files = response.data.files || [];

    return res.status(200).json({ success: true, files });
  } catch (error) {
    console.error("Drive API error", error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Failed to list Drive files" });
  }
};
