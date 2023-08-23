require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");
const audioRequest = require("./input_object");

// Get the API key 
const apiKey = process.env.GOOGLE_API_KEY;

// Define the path to the CSV file
const csvFilePath = "./Data.csv"; // Replace with your CSV file path
const audioOutputDir = "./"; // Root directory of the Node.js application

// Check if the CSV file exists before reading it
if (fs.existsSync(csvFilePath)) {
  // Read CSV and create folders and audio files
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", async (row) => {
      const filePrefix = row["Sr.No"];
      const folderName = row["Folder Name"];
      const enUSText = row["en-US"];
      const arSAText = row["ar-SA"];
      const hiINText = row["hi-IN"];

      // Create a folder for each row
      fs.mkdirSync(`${audioOutputDir}/${folderName}`, { recursive: true });

      // Convert text to audio and save as .mp3 files
      async function generateAndSaveAudio(text, langCode, fileName, voiceName) {
        if (text.trim() !== "") {
          // Only generate audio if the text is not empty or consists of only whitespace
          audioRequest.input.text = text;
          audioRequest.voice.languageCode = langCode;
          audioRequest.voice.name = voiceName;

          try {
            const audioResponse = await axios.post(
              process.env.API_URL + apiKey,
              audioRequest
            );

            const audioData = audioResponse.data.audioContent;

            // Save audio to a file
            fs.writeFileSync(
              `${audioOutputDir}/${folderName}/${fileName}.mp3`,
              audioData,
              "base64"
            );
          } catch (err) {
            console.error(
              `Error generating audio for ${fileName}: ${err.message}`
            );
          }
        }
      }

      generateAndSaveAudio(
        enUSText,
        "en-US",
        `${filePrefix}-en-US`,
        process.env.EN_US_VOICE_NAME
      );
      generateAndSaveAudio(
        arSAText,
        "ar-SA",
        `${filePrefix}-ar-SA`,
        process.env.AR_SA_VOICE_NAME
      );
      generateAndSaveAudio(
        hiINText,
        "hi-IN",
        `${filePrefix}-hi-IN`,
        process.env.HI_IN_VOICE_NAME
      );
    })
    .on("end", () => {
      console.log("CSV processing complete.");
    });
} else {
  console.error("The CSV file does not exist.");
}


