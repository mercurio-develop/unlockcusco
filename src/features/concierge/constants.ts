export const WELCOME_TEXT_ES = "Bienvenido a UnlockCusco. ✨ Soy tu guía local en el Valle Sagrado.\n\nPuedo ayudarte a planear un día perfecto. **Esto es lo que puedo hacer por ti:**\n• **Crear y Modificar Itinerarios:** Puedo armar un plan de día completo, o hacer ajustes específicos a tu ruta actual.\n• **Control del Itinerario:** Pídeme que establezca tus lugares de inicio o fin, cambie experiencias que no te gusten, reordene paradas, o las elimine por completo.\n• **Encontrar Joyas Ocultas:** Recomendar los mejores restaurantes locales, hospedajes y actividades.\n• **Manejar Logística:** Estimar tarifas de taxi, revisar info del Boleto Turístico, y responder preguntas locales.\n\nAquí tienes cómo navegar:\n🔍 **Descubrir**: Explora experiencias locales usando los filtros de arriba.\n📅 **Itinerario**: Tu línea de tiempo personal donde organizamos tus opciones en un horario perfecto.\n🤖 **Recomendaciones de IA**: Busca el ícono del robot en el mapa o en la pestaña de descubrir. Estos identifican las mejores recomendaciones curadas específicamente para ti por el Concierge.\n✨ **Personalizar**: Usa el ícono de ajustes ([[SETTINGS_ICON]]) en el menú superior para establecer tu estilo de viaje e intensidad para mejores recomendaciones.\n\nEstoy listo cuando tú lo estés. Dime, ¿qué tienes en mente para la aventura de hoy?";

export const WELCOME_TEXT_EN = "Welcome to UnlockCusco. ✨ I'm your local guide to the Sacred Valley.\n\nI can help you plan a perfect day. **Here's what I can do for you:**\n• **Build & Modify Itineraries:** I can create a full day plan, or make specific tweaks to your current route.\n• **Itinerary Control:** Ask me to set your start or end locations, swap out experiences you don't like, reorder stops, or remove them entirely.\n• **Find Hidden Gems:** Recommend the best local restaurants, stays, and activities.\n• **Handle Logistics:** Estimate taxi fares, check Boleto Turístico info, and answer local questions.\n\nHere's how to navigate:\n🔍 **Discover**: Browse local experiences using the filters above.\n📅 **Itinerary**: Your personal timeline where we organize your choices into a seamless schedule.\n🤖 **AI Recommendations**: Look for the robot icon on the map or in the discover tab. These identify top recommendations specifically curated for you by the Concierge.\n✨ **Personalize**: Use the settings icon ([[SETTINGS_ICON]]) in the top menu to set your travel style and intensity for better recommendations.\n\nI'm ready when you are. Tell me, what's on your mind for today's adventure?";

export const getWelcomeText = (isEs: boolean) => isEs ? WELCOME_TEXT_ES : WELCOME_TEXT_EN;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getInitialMessages = (isEs: boolean): any[] => {
  const welcomeText = getWelcomeText(isEs);
  return [
    {
      id: "1",
      role: "assistant",
      content: welcomeText,
      parts: [{ type: 'text', text: welcomeText }],
    }
  ];
};

export const DEFAULT_ANCHOR_TITLES = ['Current Location', 'Destination'];
