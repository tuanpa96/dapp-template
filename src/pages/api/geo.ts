// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler } = require("@renec-foundation/geo-lookup-api");

export default async (req: any, res: any) => await handler(req, res);
