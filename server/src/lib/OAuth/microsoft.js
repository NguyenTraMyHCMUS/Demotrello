import * as arctic from "arctic";

const entraId = new arctic.MicrosoftEntraId(
  process.env.MICROSOFT_TENANT_ID,
  process.env.MICROSOFT_CLIENT_ID,
  process.env.MICROSOFT_CLIENT_SECRET,
  process.env.MICROSOFT_REDIRECT_URI
);

export default entraId;