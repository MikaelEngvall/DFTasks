const Imap = require("node-imap");
const { simpleParser } = require("mailparser");
const PendingTask = require("../models/PendingTask");

const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
    enableTrace: true,
  },
  keepalive: true,
  debug: console.log,
};

function parseEmailContent(emailText) {
  console.log("Raw email content:", emailText); // Debug-loggning

  const lines = emailText.split("\n");
  let reporterName = "";
  let reporterEmail = "";
  let reporterPhone = "";
  let address = "";
  let apartmentNumber = "";
  let description = "";
  let isDescription = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    console.log("Processing line:", trimmedLine); // Debug-loggning

    if (trimmedLine.startsWith("Namn:")) {
      reporterName = trimmedLine.replace("Namn:", "").trim();
    } else if (trimmedLine.startsWith("E-post:")) {
      reporterEmail = trimmedLine.replace("E-post:", "").trim();
    } else if (trimmedLine.startsWith("Telefon:")) {
      reporterPhone = trimmedLine.replace("Telefon:", "").trim();
    } else if (trimmedLine.startsWith("Adress:")) {
      address = trimmedLine.replace("Adress:", "").trim();
    } else if (trimmedLine.startsWith("Lägenhetsnummer:")) {
      apartmentNumber = trimmedLine.replace("Lägenhetsnummer:", "").trim();
    } else if (trimmedLine.startsWith("Beskrivning:")) {
      isDescription = true;
    } else if (isDescription && trimmedLine) {
      description += trimmedLine + "\n";
    }
  }

  const parsedContent = {
    reporterName,
    reporterEmail,
    reporterPhone,
    address,
    apartmentNumber,
    description: description.trim() || "Ingen beskrivning tillgänglig", // Sätt standardvärde om tom
  };

  console.log("Parsed content:", parsedContent); // Debug-loggning
  return parsedContent;
}

function processEmail(stream) {
  simpleParser(stream, async (err, parsed) => {
    if (err) {
      console.error("Error parsing email:", err);
      return;
    }

    try {
      const emailContent = parsed.text;
      const parsedContent = parseEmailContent(emailContent);

      const title = `${parsedContent.address} - Lgh ${parsedContent.apartmentNumber} - ${parsedContent.reporterPhone}`;

      const pendingTask = new PendingTask({
        title,
        description: parsedContent.description,
        reporterName: parsedContent.reporterName,
        reporterEmail: parsedContent.reporterEmail,
        reporterPhone: parsedContent.reporterPhone,
        address: parsedContent.address,
        apartmentNumber: parsedContent.apartmentNumber,
      });

      await pendingTask.save();
      console.log("Pending task created:", title);
    } catch (error) {
      console.error("Error creating pending task:", error);
    }
  });
}

let retryCount = 0;
const MAX_RETRIES = 5;

function startEmailListener() {
  console.log("Starting email listener...");
  const imap = new Imap(imapConfig);

  function handleConnectionError(err) {
    console.error("IMAP connection error:", err);
    retryCount++;

    if (retryCount <= MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 300000); // Max 5 minutes
      console.log(
        `Retry attempt ${retryCount} of ${MAX_RETRIES} in ${
          delay / 1000
        } seconds`
      );
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        startEmailListener();
      }, delay);
    } else {
      console.error(
        "Max retry attempts reached. Please check the email configuration."
      );
    }
  }

  imap.once("ready", () => {
    console.log("IMAP connection established successfully");
    retryCount = 0; // Reset retry count on successful connection

    imap.openBox("INBOX", false, (err, box) => {
      if (err) {
        console.error("Error opening inbox:", err);
        return;
      }

      console.log("Inbox opened successfully");

      // Lyssna på nya mail
      imap.on("mail", () => {
        console.log("New email received");
        const fetch = imap.seq.fetch(`${box.messages.total}:*`, {
          bodies: "",
          struct: true,
        });

        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            processEmail(stream);
          });
        });

        fetch.once("error", (err) => {
          console.error("Fetch error:", err);
        });

        fetch.once("end", () => {
          console.log("Message processing completed");
        });
      });
    });
  });

  imap.once("error", handleConnectionError);

  imap.once("end", () => {
    console.log("IMAP connection ended");
    handleConnectionError(new Error("Connection ended unexpectedly"));
  });

  try {
    console.log("Attempting to connect to IMAP server...");
    imap.connect();
  } catch (err) {
    handleConnectionError(err);
  }
}

// Exportera endast startEmailListener
module.exports = { startEmailListener };
