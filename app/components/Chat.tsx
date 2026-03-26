// Replace the following lines in the app/components/Chat.tsx

type ModeInstructionsType = { [key: string]: string }; 
const modeInstructionsMap: ModeInstructionsType = { 
    standard: "MODE: STANDARD...", 
    approfondi: "MODE: APPROFONDI...", 
    academique: "MODE: ACADÉMIQUE..." 
};

const modeInstruction = modeInstructionsMap[researchMode] || modeInstructionsMap.standard;