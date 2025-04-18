import { parseString } from 'xml2js';

const x509Certificate = `
-----BEGIN CERTIFICATE-----
MIIDeDCCAmCgAwIBAgIUWWmTliYOJ4TqQqPLcjLMkhM9dSIwDQYJKoZIhvcNAQEL
BQAwRzELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAlRYMRgwFgYDVQQKDA9TaW1wbGVy
IFRyYWRpbmcxETAPBgNVBAMMCGxvY2FsLmNhMB4XDTIyMDcyOTE1MzEyNloXDTI0
MTAzMTE1MzEyNlowRzELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAlRYMRgwFgYDVQQK
DA9TaW1wbGVyIFRyYWRpbmcxETAPBgNVBAMMCHN0LmxvY2FsMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzmEe4QsB2mIEoSahMsWKyzShAimrsFpUbdyI
leZ5G9rVdBbuMzSfrov4LfuSvxbYEfsm0mKTfooAZ3qEAHi9TCk6TqI74HRbjPUv
MDxLNUM3MFL29W4qdHhlp0xJdNwu5cHnrEE/NbSKfO3MRh9sZCMGMxcvkONxfVlv
lXawFhbw9VeVYn6mf30NW3GMWspMeCkatO43JZe1awwEi4zq4c8RbIcgkC0x2N6c
IlYtLiubd326UJAtisVJJyqXXgJPz5injS19nrisrW7wCwm/kOcwtlD/z8v/aoTs
izQRXvVTFWzAyPQJLXgaHSGy3LEOMOxc1p2UfQKsCekj5D8vzwIDAQABo1wwWjAf
BgNVHSMEGDAWgBTgkESpVm8dPOFjMJUUYgehXk1INzAJBgNVHRMEAjAAMAsGA1Ud
DwQEAwIE8DAfBgNVHREEGDAWggoqLnN0LmxvY2FsgghzdC5sb2NhbDANBgkqhkiG
9w0BAQsFAAOCAQEACWatuW7PWHwJvmBXMaqlcczkdZ2XaLxIxlEnMoG3irPQMm7X
qPeeOwk3JaXoE3sB91IdhijAmFdtThbugBQhNktRaoJwpLO76niaGP8e1zOauDvj
bSr5bg13VVMZ2wlXk1NoOQw6lyrtQxUQsdKQRP+3jz43EtiHTL/+hOBScqm17Bw5
NenjFRyFED23hXnCYGbyAFPI2hEfaBs4USCvs2jpenOpDvUdzDSFouB577+3FOfJ
lCBdYsBNyT1hzHnPAxOQCqVE4R26GpFue7w8+/0YLl86s3QEBXnmujsss/JckDcu
V8Es0rQYh806xEakN2sMWPZEZZUkI2wGJ2XCbQ==
-----END CERTIFICATE-----
`;

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

      // Set a cookie with the X.509 certificate
      res.setHeader('Set-Cookie', `x509Certificate=${encodeURIComponent(x509Certificate)}; HttpOnly; Secure; Path=/;`);

      res.status(200).json({ message: "Request data logged successfully, cookie set with X.509 certificate" });
    } catch (error) {
      console.error("Error processing request:", error); // Log any unexpected errors
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    console.warn("Unsupported request method:", req.method); // Log unsupported methods
    res.status(405).json({ message: "Method not allowed" });
  }
}
