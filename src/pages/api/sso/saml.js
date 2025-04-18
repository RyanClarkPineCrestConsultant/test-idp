import { generateSAMLAssertion } from '../../../utils/generateSAMLAssertion';

const handler = async (req, res) => {
  try {
    console.log("Request received:", req.body);

    const response = generateSAMLAssertion({
      destination: "https://itest1.ease.com/v2/sso/saml2",
      issuer: "urn:mock-idp:dev",
      nameId: "ryan.clark@pinecrestconsulting.com",
      attributes: {},
    });

    console.log("Generated SAML Assertion:", response);

    const htmlResponse = `
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="https://itest1.ease.com/v2/sso/saml2">
          <input type="hidden" name="SAMLResponse" value="${Buffer.from(response).toString('base64')}" />
        </form>
      </body>
    </html>
    `;

    // Send the HTML response to the browser
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse);
  } catch (error) {
    console.error("Error in SAML handler:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default handler;