import { create } from "xmlbuilder2";
import { SignedXml } from "xml-crypto";
import crypto from "crypto";
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
  const notOnOrAfter = new Date(Date.now() + 5 * 60_000).toISOString();
  const responseId = `_${crypto.randomUUID().replace(/-/g, "")}`;
  const assertionId = `_${crypto.randomUUID().replace(/-/g, "")}`;
  const sessionIndex = `_session_${crypto.randomUUID().replace(/-/g, "")}`;

  /* ───────────────────────── XML BUILD ───────────────────────── */

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
    .up() // </Status> </StatusCode>
    .ele("saml:Assertion", {
      ID: assertionId,
      Version: "2.0",
      IssueInstant: issueInstant,
    })
    .ele("saml:Issuer")
    .txt(issuer)
    .up() // <Issuer> (Signature will be injected *after* this node)

    .ele("saml:Subject")
    .ele("saml:NameID", {
      Format: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
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
    .up() // </Subject>

    .ele("saml:Conditions", {
      NotBefore: issueInstant,
      NotOnOrAfter: notOnOrAfter,
    })
    .ele("saml:AudienceRestriction")
    .ele("saml:Audience")
    .txt(destination)
    .up()
    .up()
    .up()

    .ele("saml:AuthnStatement", {
      AuthnInstant: issueInstant,
      SessionIndex: sessionIndex,
      SessionNotOnOrAfter: notOnOrAfter,
    })
    .ele("saml:AuthnContext")
    .ele("saml:AuthnContextClassRef")
    .txt("urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified")
    .up()
    .up()
    .up(); // </AuthnStatement>

  /* ────────────── Attributes (NameFormat fix) ────────────── */

  const attrStatement = doc.ele("saml:AttributeStatement");

  for (const [rawName, value] of Object.entries(attributes)) {
    const isUri = /^https?:\/\//.test(rawName);
    attrStatement
      .ele("saml:Attribute", {
        Name: rawName,
        NameFormat: isUri
          ? "urn:oasis:names:tc:SAML:2.0:attrname-format:uri"
          : "urn:oasis:names:tc:SAML:2.0:attrname-format:basic",
        FriendlyName: rawName.split(/[/.]/).pop(), // nice to have
      })
      .ele("saml:AttributeValue", {
        "xsi:type": typeof value === "boolean" ? "xs:boolean" : "xs:string",
      })
      .txt(String(value))
      .up()
      .up();
  }

  const unsignedXml = doc.end({ prettyPrint: false });

  /* ────────────────────────── SIGN ────────────────────────── */

  const privateKey = fs.readFileSync(
    path.join(__dirname, "../../private/pk.pem"),
    "utf8",
  );
  const cert = fs
    .readFileSync(
      path.join(__dirname, "../../private/fon.pem"),
      "utf8",
    )
    .replace(/-----BEGIN CERTIFICATE-----\s*/g, "")
    .replace(/-----END CERTIFICATE-----\s*/g, "")
    .replace(/\r?\n|\r/g, "");

  const sig = new SignedXml({
    privateKey,
    canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#",
    signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    getKeyInfoContent: () =>
      `<X509Data><X509Certificate>${cert}</X509Certificate></X509Data>`,
  });

  sig.addReference({
    xpath: `//*[@ID="${assertionId}"]`,
    transforms: [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
      "http://www.w3.org/2001/10/xml-exc-c14n#",
    ],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
  });

  sig.computeSignature(unsignedXml, {
    location: {
      reference:
        "//*[local-name()='Issuer' and parent::*[local-name()='Assertion']]",
      action: "after", // place <Signature> right after <Issuer>
    },
  });

  const signedXml = sig.getSignedXml();

  return {
    base64: Buffer.from(signedXml, "utf8").toString("base64"), // explicit UTF‑8
    raw: signedXml,
    x509: cert,
  };
};
