import { generateSAMLAssertion } from '../../../utils/generate-assertion';



const handler = async (req, res) => {
  try {
    const { x509, base64, raw } = generateSAMLAssertion({
      destination: "https://itest1.ease.com/v2/sso/saml2",
      issuer: "https://auth.example.com/realms/your-realm",
      nameId: "ryan.clark+1@pinecrestconsulting.com",
      attributes: {
        Email: "ryan.clark+1@pinecrestconsulting.com",
      },
    });

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send({base64, raw, x509});
  } catch (error) {
    console.error('Error generating SAML assertion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;