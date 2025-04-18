import { create } from "xmlbuilder2";
import { SignedXml } from "xml-crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateSAMLAssertion = ({
  destination,
  issuer,
  nameId,
  attributes,
}) => {
  const issueInstant = new Date().toISOString();
  const notOnOrAfter = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const responseId = `_${crypto.randomUUID().replace(/-/g, "")}`;
  const assertionId = `_${crypto.randomUUID().replace(/-/g, "")}`;
  const sessionIndex = `_session_${crypto.randomUUID().replace(/-/g, "")}`;

  const doc = create({ version: "1.0", encoding: "UTF-8" })
    .ele("samlp:Response", {
      "xmlns:samlp": "urn:oasis:names:tc:SAML:2.0:protocol",
      "xmlns:saml": "urn:oasis:names:tc:SAML:2.0:assertion",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xmlns:xs": "http://www.w3.org/2001/XMLSchema",
      ID: responseId,
      Version: "2.0",
      IssueInstant: issueInstant,
      Destination: destination,
    })
    .ele("saml:Issuer")
    .txt(issuer)
    .up()
    .ele("samlp:Status")
    .ele("samlp:StatusCode", {
      Value: "urn:oasis:names:tc:SAML:2.0:status:Success",
    })
    .up()
    .up()
    .ele("saml:Assertion", {
      ID: assertionId,
      Version: "2.0",
      IssueInstant: issueInstant,
    })
    .ele("saml:Issuer")
    .txt(issuer)
    .up()
    // Signature will be injected here later
    .ele("saml:Subject")
    .ele("saml:NameID", {
      Format: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress", // Updated format
    })
    .txt(nameId)
    .up()
    .ele("saml:SubjectConfirmation", {
      Method: "urn:oasis:names:tc:SAML:2.0:cm:bearer",
    })
    .ele("saml:SubjectConfirmationData", {
      NotOnOrAfter: notOnOrAfter,
      Recipient: destination,
    })
    .up()
    .up()
    .up()
    .ele("saml:Conditions", {
      NotBefore: issueInstant,
      NotOnOrAfter: notOnOrAfter,
    })
    .up()
    .ele("saml:AuthnStatement", {
      AuthnInstant: issueInstant,
      SessionIndex: sessionIndex,
    })
    .ele("saml:AuthnContext")
    .ele("saml:AuthnContextClassRef")
    .txt("urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified")
    .up()
    .up()
    .up();

  // Explicitly append the AttributeStatement to the Assertion
  const assertionElement = doc.last();
  const attributeStatement = assertionElement.ele("saml:AttributeStatement");

  // Add attributes
  const attributesToAdd = {
    email: nameId,
    firstName: "Ryan",
    lastName: "Clark",
  };

  for (const [name, value] of Object.entries(attributesToAdd)) {
    attributeStatement
      .ele("saml:Attribute", {
        Name: name,
        NameFormat: "urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified",
      })
      .ele("saml:AttributeValue", {
        "xsi:type": "xs:string",
      })
      .txt(value)
      .up()
      .up();
  }

  const unsignedXml = doc.end({ prettyPrint: false });

  // === SIGN ===
  const privateKey = fs.readFileSync(
    path.join(__dirname, "../../private/pk.pem"),
    "utf-8",
  );
  const cert = fs.readFileSync(
    path.join(__dirname, "../../private/fon.pem"),
    "utf-8",
  ).replace(/-----BEGIN CERTIFICATE-----/, "")
   .replace(/-----END CERTIFICATE-----/, "")
   .replace(/\n/g, "");

  const sig = new SignedXml({ privateKey: privateKey });
  sig.canonicalizationAlgorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";
  sig.signatureAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";

  sig.addReference({
    xpath: `//*[@ID="${assertionId}"]`,
    transforms: [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
      "http://www.w3.org/2001/10/xml-exc-c14n#",
    ],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
  });

  sig.keyInfoProvider = {
    getKeyInfo: () =>
      `<X509Data><X509Certificate>${cert}</X509Certificate></X509Data>`,
  };

  sig.computeSignature(unsignedXml, {
    location: {
      reference: `//*[local-name(.)='Issuer'][ancestor::*[local-name(.)='Assertion']]`,
      action: "after",
    },
  });

  const signedXml = sig.getSignedXml();

  return signedXml;
};