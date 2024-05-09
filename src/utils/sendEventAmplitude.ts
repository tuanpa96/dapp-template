import amplitude from "amplitude-js";

let amplitudeInitialized = false;

const initializeAmplitude = (apiKey: string) => {
  amplitude.getInstance().init(apiKey);
  amplitudeInitialized = true;
};

if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
  initializeAmplitude(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY);
}

export const sendEventLog = (eventName: string, data?: any) => {
  try {
    if (amplitudeInitialized) {
      amplitude.getInstance().logEvent(eventName, data);
    }
  } catch (e) {
    console.error(e);
  }
};
