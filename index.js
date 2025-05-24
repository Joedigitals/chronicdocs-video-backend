require("dotenv").config();
const http = require("http");
const express = require("express");
const path = require("path");
const { jwt: { AccessToken } } = require("twilio");
const { VideoGrant } = AccessToken;

const app = express();
app.use(express.json());

const MAX_ALLOWED_SESSION_DURATION = 14400;

app.get("/", (req, res) => {
  res.send("ChronicDocs Video Backend");
});

app.post("/token", (req, res) => {
  const identity = req.body.identity;
  const roomName = req.body.roomName;

  if (!identity || !roomName) {
    return res.status(400).send("Identity and roomName required");
  }

  const token = new AccessToken(
    process.env.AC34ba8e70d5ab89923a57c16f553b9873,
    process.env.SKf73505fab7d8489d286edfdf272d3827,
    process.env.Lxfu69OkGa9EyCe0XGjAytZSw8j3LaGT,
    { identity: identity, ttl: MAX_ALLOWED_SESSION_DURATION }
  );

  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);

  res.send({ token: token.toJwt() });
});

const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});