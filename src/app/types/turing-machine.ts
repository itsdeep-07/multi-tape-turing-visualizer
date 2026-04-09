// Turing Machine Types

export type Direction = 'L' | 'R' | 'N'; // Left, Right, No movement

export interface Transition {
  currentState: string;
  readSymbols: string[]; // One symbol per tape
  nextState: string;
  writeSymbols: string[]; // One symbol per tape
  moveDirections: Direction[]; // One direction per tape
}

export interface TuringMachineConfig {
  numTapes: number;
  states: string[];
  alphabet: string[];
  tapeAlphabet: string[];
  transitions: Transition[];
  initialState: string;
  acceptStates: string[];
  rejectStates: string[];
  blankSymbol: string;
  startPositions?: number[];
}

export interface TapeState {
  cells: Map<number, string>;
  headPosition: number;
}

export interface MachineState {
  tapes: TapeState[];
  currentState: string;
  stepCount: number;
  isRunning: boolean;
  isAccepted: boolean;
  isRejected: boolean;
  isHalted: boolean;
  lastTransition?: Transition | null;
}

export interface Example {
  name: string;
  description: string;
  config: TuringMachineConfig;
  initialTapes: string[];
}