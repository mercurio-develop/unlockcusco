const { convertToModelMessages } = require('ai');
const messages = [
  {
    "parts": [
      {
        "type": "text",
        "text": "I need a taxi from Urubamba to Pisac"
      }
    ],
    "id": "AbqjkCSVzaOVSGtW",
    "role": "user"
  }
];
console.log(convertToModelMessages(messages));
