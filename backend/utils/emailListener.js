import Imap from "node-imap";
import { simpleParser } from "mailparser";
import PendingTask from "../models/PendingTask.js";

const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
    enableTrace: false,
  },
  keepalive: true,
};

function parseEmailContent(emailText) {
  const lines = emailText.split("\n");
  let reporterName = "";
  let reporterEmail = "";
  let reporterPhone = "";
  let address = "";
  let apartmentNumber = "";
  let description = [];
  let isDescription = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("Namn:")) {
      reporterName = trimmedLine.replace("Namn:", "").trim();
    } else if (trimmedLine.startsWith("E-post:")) {
      reporterEmail = trimmedLine.replace("E-post:", "").trim();
    } else if (trimmedLine.startsWith("Telefonnummer:")) {
      reporterPhone = trimmedLine.replace("Telefonnummer:", "").trim();
    } else if (trimmedLine.startsWith("Adress:")) {
      address = trimmedLine.replace("Adress:", "").trim();
    } else if (trimmedLine.startsWith("Lägenhetsnummer:")) {
      apartmentNumber = trimmedLine.replace("Lägenhetsnummer:", "").trim();
    } else if (trimmedLine.startsWith("Meddelande:")) {
      isDescription = true;
      description.push(trimmedLine.replace("Meddelande:", "").trim());
    } else if (trimmedLine === "---") {
      isDescription = false;
    } else if (isDescription && trimmedLine) {
      description.push(trimmedLine);
    }
  }

  return {
    reporterName,
    reporterEmail,
    reporterPhone,
    address,
    apartmentNumber,
    description: description.join("\n") || "Ingen beskrivning tillgänglig",
  };
}

function processEmail(stream, seqno, uid) {
  simpleParser(stream, async (err, parsed) => {
    if (err) {
      console.error("Error parsing email:", err);
      return;
    }

    try {
      const emailContent = parsed.text;
      const messageId = parsed.messageId; // Unikt ID för e-postmeddelandet

      // Kontrollera om en pending task med samma messageId redan finns
      const existingTask = await PendingTask.findOne({ messageId });
      if (existingTask) {
        console.log("Duplicate email detected, skipping processing");
        return;
      }

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
        messageId, // Spara messageId för framtida dubblettkontroll
      });

      await pendingTask.save();
      console.log("New pending task created:", title);
    } catch (error) {
      console.error("Error creating pending task:", error);
    }
  });
}

let retryCount = 0;
const MAX_RETRIES = 5;

function startEmailListener() {
  const imap = new Imap(imapConfig);

  function handleConnectionError(err) {
    console.error("IMAP connection error:", err);
    retryCount++;

    if (retryCount <= MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 300000);
      setTimeout(() => {
        startEmailListener();
      }, delay);
    } else {
      console.error(
        "Max retry attempts reached. Please check the email configuration."
      );
    }
  }

  imap.once("ready", () => {
    retryCount = 0;

    imap.openBox("INBOX", false, (err, box) => {
      if (err) {
        console.error("Error opening inbox:", err);
        return;
      }

      imap.on("mail", () => {
        const fetch = imap.seq.fetch(`${box.messages.total}:*`, {
          bodies: "",
          struct: true,
          markSeen: true,
        });

        fetch.on("message", (msg, seqno) => {
          let uid;

          msg.once("attributes", (attrs) => {
            uid = attrs.uid;
          });

          msg.on("body", (stream) => {
            processEmail(stream, seqno, uid);
          });

          msg.once("end", () => {
            // Markera meddelandet som läst
            imap.addFlags(seqno, ["\\Seen"], (err) => {
              if (err) {
                console.error("Error marking message as read:", err);
              }
            });
          });
        });

        fetch.once("error", (err) => {
          console.error("Fetch error:", err);
        });
      });
    });
  });

  imap.once("error", handleConnectionError);

  imap.once("end", () => {
    handleConnectionError(new Error("Connection ended unexpectedly"));
  });

  try {
    imap.connect();
  } catch (err) {
    handleConnectionError(err);
  }
}

export { startEmailListener };
