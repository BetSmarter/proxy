require("dotenv").config();
const fs = require("fs");
const request = require("request-promise-native");
const SQUID_INITIAL_CONFIGURATION_DIR =
  process.env.SQUID_INITIAL_CONFIGURATION_DIR || "./squid.conf";
const API_URL =
  process.env.API_URL ||
  "https://3runeaq6o2.execute-api.eu-central-1.amazonaws.com/dev/proxy";

const getExternalIP = async () => {
  const externalIPRequest = await request({
    uri: "https://api.ipify.org?format=json",
    json: true
  });
  return externalIPRequest.ip;
};

const updateInformation = async (email, refreshToken, externalIP) =>
  request({
    uri: API_URL,
    body: {
      email,
      refreshToken,
      externalIP
    },
    method: "POST",
    json: true
  });

const getStateInformation = () => require("./state.json");

const saveInformation = ({ sourceIP, refreshToken, externalIP }) => {
  const previousState = require("./state.json");
  const mergedState = { ...previousState, sourceIP, refreshToken, externalIP };
  fs.writeFileSync("./state.json", JSON.stringify(mergedState, null, 2));
};

const main = async () => {
  const state = getStateInformation();
  const { email, refreshToken } = state;
  const externalIP = await getExternalIP();

  const updatedInformation = await updateInformation(
    email,
    refreshToken,
    externalIP
  );
  saveInformation({ ...updatedInformation, externalIP });
};

main();
