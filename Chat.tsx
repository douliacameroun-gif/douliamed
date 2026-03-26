interface ModeInstructions {
  [key: string]: string;
}

const modeInstructions: ModeInstructions = {
  // existing properties
};

// Update link handling logic
const handleLinkClick = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
