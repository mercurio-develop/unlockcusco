const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/lib/dictionaries/en.json');
const esPath = path.join(__dirname, 'src/lib/dictionaries/es.json');

const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const esDict = JSON.parse(fs.readFileSync(esPath, 'utf8'));

enDict.businessCard = {
  "viewProfile": "View Profile",
  "whatsapp": "WhatsApp",
  "requiresBoleto": "Requires Boleto Turístico",
  "boletoTitle": "Cusco Tourist Ticket (BTC)",
  "boletoDesc1": "This site requires the",
  "boletoDesc2": "It's a unified government-managed ticket allowing access to up to 16 major archaeological sites and museums in Cusco and the Sacred Valley.",
  "options": "Options:",
  "fullTicket": "Full Ticket (130 Soles):",
  "fullTicketDesc": "Valid for 10 days. Includes all 16 sites across Cusco, Sacred Valley, and South Valley.",
  "partialTicket": "Partial Ticket (70 Soles):",
  "partialTicketDesc": "Valid for 1-2 days for a specific circuit (e.g., Sacred Valley ruins only).",
  "note": "Note: The ticket cannot be purchased online in advance. It must be bought in person at the COSITUC office (Av. El Sol 103, Cusco) or at the entrance of the first site you visit.",
  "gotIt": "Got it",
  "selected": "Selected",
  "swap": "Swap",
  "exchange": "Exchange",
  "add": "Add",
  "map": "Map",
  "details": "Details",
  "verified": "Verified"
};

esDict.businessCard = {
  "viewProfile": "Ver Perfil",
  "whatsapp": "WhatsApp",
  "requiresBoleto": "Requiere Boleto Turístico",
  "boletoTitle": "Boleto Turístico del Cusco (BTC)",
  "boletoDesc1": "Este sitio requiere el",
  "boletoDesc2": "Es un boleto unificado administrado por el gobierno que permite el acceso a hasta 16 sitios arqueológicos y museos importantes en Cusco y el Valle Sagrado.",
  "options": "Opciones:",
  "fullTicket": "Boleto Integral (130 Soles):",
  "fullTicketDesc": "Válido por 10 días. Incluye los 16 sitios en Cusco, Valle Sagrado y Valle Sur.",
  "partialTicket": "Boleto Parcial (70 Soles):",
  "partialTicketDesc": "Válido por 1-2 días para un circuito específico (ej., solo ruinas del Valle Sagrado).",
  "note": "Nota: El boleto no se puede comprar en línea por adelantado. Debe comprarse en persona en la oficina de COSITUC (Av. El Sol 103, Cusco) o en la entrada del primer sitio que visite.",
  "gotIt": "Entendido",
  "selected": "Seleccionado",
  "swap": "Cambiar",
  "exchange": "Intercambiar",
  "add": "Añadir",
  "map": "Mapa",
  "details": "Detalles",
  "verified": "Verificado"
};

fs.writeFileSync(enPath, JSON.stringify(enDict, null, 2));
fs.writeFileSync(esPath, JSON.stringify(esDict, null, 2));
console.log("Dictionaries updated successfully");
