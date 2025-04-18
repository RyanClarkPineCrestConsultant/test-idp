import { parseString } from 'xml2js';

export default function handler(req, res) {
  console.log("Incoming SSO request:", {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query, // Log query parameters for GET requests
  }); // Log all incoming request details

  if (req.method === "POST" || req.method === "GET") {
    try {
      console.log("Request Data:", {
        body: req.body,
        query: req.query,
      }); // Log the body and query data for inspection

      res.status(200).json({ message: "Request data logged successfully" });
    } catch (error) {
      console.error("Error processing request:", error); // Log any unexpected errors
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    console.warn("Unsupported request method:", req.method); // Log unsupported methods
    res.status(405).json({ message: "Method not allowed" });
  }
}
