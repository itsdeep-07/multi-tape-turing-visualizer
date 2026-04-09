import { Transition } from '../types/turing-machine';

interface Token {
  char: string;
  isStar: boolean;
}

/**
 * Compiles a simple regex pattern (like "a*b*c" or "01*0") into a 1-Tape Turing Machine.
 */
export function compileSimplePatternToTM(pattern: string) {
  const tokens: Token[] = [];
  const alphabet = new Set<string>();

  // 1. Parse the string into tokens
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (char === '*') continue;
    
    alphabet.add(char);
    const isStar = i + 1 < pattern.length && pattern[i + 1] === '*';
    tokens.push({ char, isStar });
  }

  const transitions: Transition[] = [];
  const states: string[] = [];
  let currentStateIndex = 0;

  states.push(`q${currentStateIndex}`);

  // 2. Generate Transitions
  for (let i = 0; i < tokens.length; i++) {
    const currentToken = tokens[i];
    const currentState = `q${currentStateIndex}`;
    const nextState = `q${currentStateIndex + 1}`;

    if (currentToken.isStar) {
      // Self-loop for the current character
      transitions.push({
        currentState: currentState,
        readSymbols: [currentToken.char],
        nextState: currentState,
        writeSymbols: [currentToken.char],
        moveDirections: ['R'],
      });

      // Look ahead to find the next required character to break out of the loop
      const nextToken = tokens[i + 1];
      const triggerChar = nextToken ? nextToken.char : '_';
      
      states.push(nextState);
      transitions.push({
        currentState: currentState,
        readSymbols: [triggerChar],
        nextState: nextState,
        writeSymbols: [triggerChar],
        moveDirections: ['R'],
      });
      
      currentStateIndex++;
    } else {
      // Exact match required
      states.push(nextState);
      transitions.push({
        currentState: currentState,
        readSymbols: [currentToken.char],
        nextState: nextState,
        writeSymbols: [currentToken.char],
        moveDirections: ['R'],
      });
      currentStateIndex++;
    }
  }

  // 3. Add the Final Accept State logic
  const finalState = `q${currentStateIndex}`;
  const acceptState = 'qaccept';
  states.push(acceptState, 'qreject');

  transitions.push({
    currentState: finalState,
    readSymbols: ['_'],
    nextState: acceptState,
    writeSymbols: ['_'],
    moveDirections: ['N'],
  });

  return {
    numTapes: 1,
    alphabet: Array.from(alphabet),
    states: states,
    transitions: transitions,
    testInput: [pattern.replace(/\*/g, '')],
  };
}