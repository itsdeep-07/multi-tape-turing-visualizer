import {
  TuringMachineConfig,
  MachineState,
  TapeState,
  Transition,
} from '../types/turing-machine';

// Deep-clone a MachineState so history snapshots are independent
function cloneState(s: MachineState): MachineState {
  return {
    ...s,
    tapes: s.tapes.map((t) => ({
      cells: new Map(t.cells),
      headPosition: t.headPosition,
    })),
    lastTransition: s.lastTransition ? { ...s.lastTransition } : null,
  };
}

export class TuringMachine {
  private config: TuringMachineConfig;
  private state: MachineState;
  private history: MachineState[] = [];   // snapshots BEFORE each step

  constructor(config: TuringMachineConfig, initialTapes: string[]) {
    this.config = config;
    this.state = this.initializeState(initialTapes);
  }

  private initializeState(initialTapes: string[]): MachineState {
    const tapes: TapeState[] = [];

    for (let i = 0; i < this.config.numTapes; i++) {
      const cells = new Map<number, string>();
      const tape = initialTapes[i] || '';
      for (let j = 0; j < tape.length; j++) {
        cells.set(j, tape[j]);
      }
      const headPosition = (this.config.startPositions && this.config.startPositions.length > i) ? this.config.startPositions[i] : 0;
      tapes.push({ cells, headPosition });
    }

    return {
      tapes,
      currentState: this.config.initialState,
      stepCount: 0,
      isRunning: false,
      isAccepted: false,
      isRejected: false,
      isHalted: false,
      lastTransition: null,
    };
  }

  getState(): MachineState {
    return {
      ...this.state,
      tapes: this.state.tapes.map((tape) => ({
        cells: tape.cells,
        headPosition: tape.headPosition,
      })),
    };
  }

  /** Whether there is history to step back into */
  canStepBack(): boolean {
    return this.history.length > 0;
  }

  setState(newState: MachineState) {
    this.state = {
      ...newState,
      tapes: newState.tapes.map((tape) => {
        let cells: Map<number, string>;
        if (tape.cells instanceof Map) {
          cells = tape.cells;
        } else {
          cells = new Map(
            Object.entries(tape.cells as Record<string, string>).map(([k, v]) => [
              Number(k),
              v,
            ])
          );
        }
        return { cells, headPosition: tape.headPosition };
      }),
    };
  }

  private readSymbol(tapeIndex: number): string {
    const tape = this.state.tapes[tapeIndex];
    return tape.cells.get(tape.headPosition) || this.config.blankSymbol;
  }

  private writeSymbol(tapeIndex: number, symbol: string) {
    const tape = this.state.tapes[tapeIndex];
    if (symbol === this.config.blankSymbol) {
      tape.cells.delete(tape.headPosition);
    } else {
      tape.cells.set(tape.headPosition, symbol);
    }
  }

  private moveHead(tapeIndex: number, direction: 'L' | 'R' | 'N') {
    const tape = this.state.tapes[tapeIndex];
    if (direction === 'L') tape.headPosition--;
    else if (direction === 'R') tape.headPosition++;
  }

  private findTransition(): Transition | null {
    const readSymbols = this.state.tapes.map((_, i) => this.readSymbol(i));
    return (
      this.config.transitions.find(
        (t) =>
          t.currentState === this.state.currentState &&
          t.readSymbols.every((sym, i) => sym === readSymbols[i])
      ) || null
    );
  }

  step(): boolean {
    if (this.state.isHalted) return false;

    if (this.config.acceptStates.includes(this.state.currentState)) {
      this.history.push(cloneState(this.state));
      this.state.isAccepted = true;
      this.state.isHalted = true;
      return false;
    }

    if (this.config.rejectStates.includes(this.state.currentState)) {
      this.history.push(cloneState(this.state));
      this.state.isRejected = true;
      this.state.isHalted = true;
      return false;
    }

    const transition = this.findTransition();
    if (!transition) {
      this.history.push(cloneState(this.state));
      this.state.isRejected = true;
      this.state.isHalted = true;
      return false;
    }

    // Save snapshot BEFORE applying
    this.history.push(cloneState(this.state));

    for (let i = 0; i < this.config.numTapes; i++) {
      this.writeSymbol(i, transition.writeSymbols[i]);
      this.moveHead(i, transition.moveDirections[i]);
    }

    this.state.currentState = transition.nextState;
    this.state.stepCount++;
    this.state.lastTransition = transition;

    return true;
  }

  /** Undo the last step. Returns true if successful. */
  stepBack(): boolean {
    if (this.history.length === 0) return false;
    this.state = this.history.pop()!;
    return true;
  }

  reset(initialTapes: string[]) {
    this.history = [];
    this.state = this.initializeState(initialTapes);
  }

  getTapeContent(tapeIndex: number, startPos: number, endPos: number): string[] {
    const tape = this.state.tapes[tapeIndex];
    const result: string[] = [];
    for (let i = startPos; i <= endPos; i++) {
      result.push(tape.cells.get(i) || this.config.blankSymbol);
    }
    return result;
  }
}
