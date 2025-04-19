import { generateSAMLAssertion } from '../../../utils/generateSAMLAssertion';
import formidable from 'formidable';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

const handler = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      console.error("Invalid request method:", req.method);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Check environment variables with fallbacks
    const issuer = process.env.SAML_ISSUER || "https://v0-new-project-nuvdt4083v6.vercel.app";
    
    console.log("Request received with body:", req.body);
    console.log("Environment variables check:", {
      SAML_ISSUER: process.env.SAML_ISSUER ? `Set: ${process.env.SAML_ISSUER}` : `Not set, using default: ${issuer}`,
      SAML_PRIVATE_KEY: process.env.SAML_PRIVATE_KEY ? "Set (length: " + process.env.SAML_PRIVATE_KEY.length + ")" : "Not set",
      SAML_CERTIFICATE: process.env.SAML_CERTIFICATE ? "Set (length: " + process.env.SAML_CERTIFICATE.length + ")" : "Not set",
    });

    // Parse form data
    const { fields } = await parseForm(req);
    console.log("Request received with fields:", fields);

    // Extract email from form data (with fallback)
    const email = fields.email || "ryan.clark+1@pinecrestconsulting.com";

    console.log("Generating SAML assertion...");
    // Generate SAML assertion with the email from the form and explicit issuer
    const response = generateSAMLAssertion({
      issuer: issuer,
      nameId: email,
      attributes: {
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname": fields.firstName || "Ryan",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname": fields.lastName || "Clark",
      }
    });

    // Check if the response contains the X509Certificate tag
    const hasX509 = response.includes("X509Certificate");
    console.log("SAML assertion generated successfully, contains X509Certificate:", hasX509);
    
    if (!hasX509) {
      console.error("WARNING: X509Certificate not found in SAML response!");
    }

    console.log("Generated SAML Assertion XML:", response);

    // Log the base64-encoded SAML response for debugging
    const base64Response = Buffer.from(response).toString('base64');
    console.log("\n\n===================================Base64 ========================================\n\n");
    console.log(base64Response);
    console.log("\n\n===================================Base64 ========================================\n\n");

    const htmlResponse = `
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="https://itest1.ease.com/v2/sso/saml2">
          <input type="hidden" name="SAMLResponse" value="${base64Response}" />
        </form>
      </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse);
  } catch (error) {
    console.error("Error in SAML handler:", error);
    // More verbose error logging
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      path: error.path
    });
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export default handler;