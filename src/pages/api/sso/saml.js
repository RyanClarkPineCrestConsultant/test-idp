import { generateSAMLAssertion } from '../../../utils/generateSAMLAssertion';

const handler = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      console.error("Invalid request method:", req.method);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    console.log("Request received with body:", req.body);

    const response = generateSAMLAssertion({
      destination: "https://itest1.ease.com/v2/sso/saml2",
      issuer: "urn:mock-idp:dev",
      nameId: "ryan.clark@pinecrestconsulting.com",
      attributes: {},
    });

    console.log("Generated SAML Assertion XML:", response);

    // Log the base64-encoded SAML response for debugging
    const base64Response = Buffer.from(response).toString('base64');
    console.log("Base64-encoded SAML Response:", base64Response);

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
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export default handler;