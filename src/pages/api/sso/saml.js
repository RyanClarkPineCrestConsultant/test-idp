import { parseString } from 'xml2js';

export default function handler(req, res) {
  console.log("Incoming SSO request:", {
    method: req.method,
    headers: req.headers,
    body: req.body,
  }); // Log the incoming request details

  if (req.method === "POST") {
    try {
      parseString(req.body, (err, result) => {
        if (err) {
          console.error("Error parsing XML:", err); // Log the error
          return res.status(500).json({ error: "Failed to parse XML" });
        }

        console.log("Parsed XML:", result); // Log the parsed XML

        // Process the parsed XML as needed
        // For example, you can extract specific data from the result object

        res.status(200).json({ message: "SSO request processed successfully" });
      });
    }
    catch (error) {
      console.error("Error processing SSO request:", error); // Log the error
      res.status(500).json({ error: "Internal Server Error" });
    } 
  }  
}
