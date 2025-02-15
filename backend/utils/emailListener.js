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
    enableTrace: true,
  },
  keepalive: true,
  debug: console.log
};

const imap = new Imap(imapConfig);

async function processEmail(stream) {
  try {
    console.log('Starting to parse email...');
    const parsed = await simpleParser(stream);
    console.log('Email parsed successfully:', {
      subject: parsed.subject,
      from: parsed.from,
      date: parsed.date
    });
    
    console.log('Email content:', parsed.text);
    
    const parsedContent = parseEmailContent(parsed.text);
    console.log('Parsed content:', parsedContent);
    
    const pendingTask = new PendingTask({
      title: parsed.subject || "Ny felanmälan",
      description: parsedContent.description,
      reporterName: parsedContent.reporterName,
      reporterEmail: parsedContent.reporterEmail,
      reporterPhone: parsedContent.reporterPhone,
      address: parsedContent.address,
      apartmentNumber: parsedContent.apartmentNumber,
      status: "pending"
    });

    console.log('Created PendingTask object:', pendingTask);
    
    const savedTask = await pendingTask.save();
    console.log('Successfully saved pending task to database:', savedTask._id);
    
    return savedTask;
  } catch (error) {
    console.error('Error in processEmail:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

function parseEmailContent(emailText) {
  console.log('Starting to parse email content...');
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
      console.log('Found reporter name:', reporterName);
    } else if (trimmedLine.startsWith("E-post:")) {
      reporterEmail = trimmedLine.replace("E-post:", "").trim();
      console.log('Found reporter email:', reporterEmail);
    } else if (trimmedLine.startsWith("Telefonnummer:")) {
      reporterPhone = trimmedLine.replace("Telefonnummer:", "").trim();
      console.log('Found reporter phone:', reporterPhone);
    } else if (trimmedLine.startsWith("Adress:")) {
      address = trimmedLine.replace("Adress:", "").trim();
      console.log('Found address:', address);
    } else if (trimmedLine.startsWith("Lägenhetsnummer:")) {
      apartmentNumber = trimmedLine.replace("Lägenhetsnummer:", "").trim();
      console.log('Found apartment number:', apartmentNumber);
    } else if (trimmedLine.startsWith("Meddelande:")) {
      isDescription = true;
      console.log('Starting description section');
      continue;
    } else if (trimmedLine === "---") {
      isDescription = false;
      console.log('Ending description section');
    } else if (isDescription && trimmedLine) {
      description.push(trimmedLine);
    }
  }

  const result = {
    reporterName,
    reporterEmail,
    reporterPhone,
    address,
    apartmentNumber,
    description: description.join("\n") || "Ingen beskrivning tillgänglig",
  };
  
  console.log('Finished parsing email content:', result);
  return result;
}

export function startEmailListener() {
  console.log('Starting email listener with config:', {
    user: imapConfig.user,
    host: imapConfig.host,
    port: imapConfig.port
  });
  
  imap.once('ready', function() {
    console.log('IMAP connection ready');
    
    imap.getBoxes((err, boxes) => {
      if (err) {
        console.error('Error getting mailboxes:', err);
        return;
      }
      
      const simplifiedBoxes = Object.keys(boxes).map(key => ({
        name: key,
        children: boxes[key].children ? Object.keys(boxes[key].children) : []
      }));
      console.log('Available mailboxes:', simplifiedBoxes);
      
      imap.openBox('INBOX', false, function(err, box) {
        if (err) {
          console.error('Error opening inbox:', err);
          return;
        }
        
        console.log('Inbox opened successfully. Messages:', {
          total: box.messages.total,
          new: box.messages.new,
          unseen: box.messages.unseen
        });

        imap.search(['UNSEEN'], function(err, results) {
          if (err) {
            console.error('Initial search error:', err);
            return;
          }
          console.log('Initial unread messages:', results);
          
          if (results.length > 0) {
            console.log(`Found ${results.length} unread messages at startup`);
            const f = imap.fetch(results, { bodies: '', markSeen: true });
            f.on('message', function(msg, seqno) {
              console.log('Processing existing message #', seqno);
              msg.on('body', function(stream) {
                processEmail(stream);
              });
            });
          }
        });

        imap.on('mail', function(numNewMsgs) {
          console.log(`New mail event triggered: ${numNewMsgs} new messages`);
          
          imap.search(['UNSEEN'], function(err, results) {
            if (err) {
              console.error('Search error:', err);
              return;
            }
            
            if (!results || !results.length) return;

            const f = imap.fetch(results, { bodies: '', markSeen: true });
            
            f.on('message', function(msg, seqno) {
              console.log('Processing message #', seqno);
              msg.on('body', function(stream) {
                processEmail(stream);
              });
            });
          });
        });
      });
    });
  });

  imap.on('error', function(err) {
    console.error('IMAP Error:', err);
    console.error('Error details:', {
      message: err.message,
      source: err.source,
      type: err.type
    });
  });

  imap.on('end', function() {
    console.log('IMAP Connection ended');
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      startEmailListener();
    }, 5000);
  });

  imap.connect();

  return function cleanup() {
    try {
      imap.end();
    } catch (error) {
      console.error('Error ending IMAP connection:', error);
    }
  };
}

export default startEmailListener;
