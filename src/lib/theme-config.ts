export const backgroundThemes = [
  { name: "Padrão", color: "60 56% 91%" }, // Original beige
  { name: "Oceano", color: "210 40% 96%" }, // Light Blue
  { name: "Verde", color: "140 40% 96%" }, // Light Green
  { name: "Névoa", color: "260 50% 96%" }, // Light Purple
  { name: "Pêssego", color: "30 60% 96%" }, // Light Orange
];

export const primaryThemes = [
  { name: "Padrão", color: "45 65% 52%" }, // Gold
  { name: "Oceano", color: "220 80% 55%" }, // Blue
  { name: "Amanhecer", color: "25 95% 55%" }, // Orange
  { name: "Floresta", color: "130 50% 45%" }, // Green
  { name: "Lavanda", color: "250 60% 60%" }, // Purple
];

export const applyTheme = (type: 'background' | 'primary', color: string) => {
  document.documentElement.style.setProperty(`--${type}`, color);
};

export const saveThemeAndNotify = (type: 'background' | 'primary', themeName: string, userId: string) => {
  const themeList = type === 'background' ? backgroundThemes : primaryThemes;
  const theme = themeList.find((t) => t.name === themeName);
  
  if (theme) {
    // Aplica o tema imediatamente
    applyTheme(type, theme.color);
    
    // Salva no localStorage
    const themeKey = `app-theme-${type}-${userId}`;
    localStorage.setItem(themeKey, themeName);
    
    // Dispara evento personalizado para notificar outros componentes
    const event = new CustomEvent('theme-changed', {
      detail: { type, themeName, userId, color: theme.color }
    });
    window.dispatchEvent(event);
    
    return true;
  }
  
  return false;
};