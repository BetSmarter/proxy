require("dotenv").config();
const fs = require("fs");
const request = require("request-promise-native");
const API_URL = process.env.API_URL || "https://api.betsmarter.app/proxy";

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

const saveInformation = ({ refreshToken, externalIP }) => {
  const previousState = require("./state.json");
  const mergedState = { ...previousState, refreshToken, externalIP };
  fs.writeFileSync("./state.json", JSON.stringify(mergedState, null, 2));
};

const main = async () => {
  const state = getStateInformation();
  const { email, refreshToken } = state;
  try {
    const externalIP = await getExternalIP();

    const updatedInformation = await updateInformation(
      email,
      refreshToken,
      externalIP
    );
    saveInformation({ ...updatedInformation, externalIP });
  } catch (err) {
    console.error(err);
  }
};

main();
