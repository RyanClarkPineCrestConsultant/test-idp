import { parseSAMLResponse } from "../../../utils/samlUtils"; // Assume a utility function for parsing SAML

export default function handler(req, res) {
  console.log("Incoming SSO request:", {
    method: req.method,
    headers: req.headers,
    body: req.body,
  }); // Log the incoming request details

  if (req.method === "POST") {
    try {
      const samlResponse = req.body.SAMLResponse; // Extract SAML response from the request body
      console.log("Received SAML Response:", samlResponse); // Log the raw SAML response

      const parsedResponse = parseSAMLResponse(samlResponse); // Parse the SAML response
      console.log("Parsed SAML Response:", parsedResponse); // Log the parsed SAML response

      if (parsedResponse) {
        res.status(200).json({ message: "SSO callback successful", user: parsedResponse });
      } else {
        res.status(400).json({ message: "Invalid SAML response" });
      }
    } catch (error) {
      console.error("Error processing SAML response:", error); // Log the error
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  } else {
    console.warn("Unsupported request method:", req.method); // Log unsupported methods
    res.status(405).json({ message: "Method not allowed" });
  }
}
