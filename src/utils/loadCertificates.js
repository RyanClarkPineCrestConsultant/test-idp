import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads the private key from environment variables or file system
 * @returns {string} The private key as a string
 */
export const loadPrivateKey = () => {
  // Try to load from environment variable
  if (process.env.SAML_PRIVATE_KEY) {
    // Replace literal '\n' with actual newlines
    return process.env.SAML_PRIVATE_KEY.replace(/\\n/g, '\n');
  }
  
  // Fall back to file system
  try {
    return fs.readFileSync(path.join(__dirname, "../../private/pk.pem"), "utf-8");
  } catch (error) {
    console.error("Error reading private key from file:", error);
    throw new Error("Private key not found. Set SAML_PRIVATE_KEY environment variable or provide a valid file.");
  }
};

/**
 * Loads the certificate from environment variables or file system
 * @param {boolean} stripHeaders - Whether to strip the PEM headers and format for XML
 * @returns {string} The certificate as a string
 */
export const loadCertificate = (stripHeaders = true) => {
  let cert;
  
  // Try to load from environment variable
  if (process.env.SAML_CERTIFICATE) {
    cert = process.env.SAML_CERTIFICATE.replace(/\\n/g, '\n');
  } else {
    // Fall back to file system
    try {
      cert = fs.readFileSync(path.join(__dirname, "../../private/fon.pem")).toString();
    } catch (error) {
      console.error("Error reading certificate from file:", error);
      throw new Error("Certificate not found. Set SAML_CERTIFICATE environment variable or provide a valid file.");
    }
  }
  
  // Strip headers if needed (for XML insertion)
  if (stripHeaders) {
    return cert
      .replace(/-----BEGIN CERTIFICATE-----/, "")
      .replace(/-----END CERTIFICATE-----/, "")
      .replace(/\n/g, "");
  }
  
  return cert;
};
