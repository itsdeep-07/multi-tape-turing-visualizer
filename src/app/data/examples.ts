import { Example } from '../types/turing-machine';

// Example 1: Binary Palindrome Checker (2 tapes)
// Tape 1: Input tape
// Tape 2: Working tape (reversed copy)
export const binaryPalindromeExample: Example = {
  name: 'Binary Palindrome Checker',
  description: 'Checks if a binary string is a palindrome using 2 tapes',
  initialTapes: ['1001', ''],
  config: {
    numTapes: 2,
    states: ['q0', 'q1', 'q2', 'qaccept', 'qreject'],
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      // Phase 1 (q0): Scan to end of input on tape 1
      { currentState: 'q0', readSymbols: ['0', '_'], nextState: 'q0', writeSymbols: ['0', '_'], moveDirections: ['R', 'N'] },
      { currentState: 'q0', readSymbols: ['1', '_'], nextState: 'q0', writeSymbols: ['1', '_'], moveDirections: ['R', 'N'] },
      { currentState: 'q0', readSymbols: ['_', '_'], nextState: 'q1', writeSymbols: ['_', '_'], moveDirections: ['L', 'N'] },

      // Phase 2 (q1): Copy input in reverse from end to beginning onto tape 2
      { currentState: 'q1', readSymbols: ['0', '_'], nextState: 'q1', writeSymbols: ['0', '0'], moveDirections: ['L', 'R'] },
      { currentState: 'q1', readSymbols: ['1', '_'], nextState: 'q1', writeSymbols: ['1', '1'], moveDirections: ['L', 'R'] },
      // When tape 1 head exits left past the start: head1=-1(blank), head2=n(blank)
      // Move head1 right to pos 0, head2 left to pos n-1
      { currentState: 'q1', readSymbols: ['_', '_'], nextState: 'q2', writeSymbols: ['_', '_'], moveDirections: ['R', 'L'] },

      // Phase 3 (q2): Scan tape 1 right while comparing with tape 2 walking left (reversed comparison)
      { currentState: 'q2', readSymbols: ['0', '0'], nextState: 'q2', writeSymbols: ['0', '0'], moveDirections: ['R', 'L'] },
      { currentState: 'q2', readSymbols: ['1', '1'], nextState: 'q2', writeSymbols: ['1', '1'], moveDirections: ['R', 'L'] },
      // Mismatch found - reject
      { currentState: 'q2', readSymbols: ['0', '1'], nextState: 'qreject', writeSymbols: ['0', '1'], moveDirections: ['N', 'N'] },
      { currentState: 'q2', readSymbols: ['1', '0'], nextState: 'qreject', writeSymbols: ['1', '0'], moveDirections: ['N', 'N'] },
      // Both heads reached end simultaneously - palindrome verified
      { currentState: 'q2', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },

    ],
  },
};

// Example 2: Addition (3 tapes)
// Tape 1: First number in binary
// Tape 2: Second number in binary
// Tape 3: Result
export const binaryAdditionExample: Example = {
  name: 'Binary Addition',
  description: 'Adds two binary numbers using 3 tapes',
  initialTapes: ['1011', '1101', ''],
  config: {
    numTapes: 3,
    states: ['q0', 'q1', 'q2', 'qaccept'],
    alphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: [],
    transitions: [
      // ── Phase 0 (q0): Scan ALL THREE heads right to find end of both inputs ──
      // Both tapes have a digit → advance all three heads right (tape 3 scans blank cells)
      { currentState: 'q0', readSymbols: ['0', '0', '_'], nextState: 'q0', writeSymbols: ['0', '0', '_'], moveDirections: ['R', 'R', 'R'] },
      { currentState: 'q0', readSymbols: ['0', '1', '_'], nextState: 'q0', writeSymbols: ['0', '1', '_'], moveDirections: ['R', 'R', 'R'] },
      { currentState: 'q0', readSymbols: ['1', '0', '_'], nextState: 'q0', writeSymbols: ['1', '0', '_'], moveDirections: ['R', 'R', 'R'] },
      { currentState: 'q0', readSymbols: ['1', '1', '_'], nextState: 'q0', writeSymbols: ['1', '1', '_'], moveDirections: ['R', 'R', 'R'] },
      // Both inputs exhausted → step back one and start adding (q1 = no carry)
      { currentState: 'q0', readSymbols: ['_', '_', '_'], nextState: 'q1', writeSymbols: ['_', '_', '_'], moveDirections: ['L', 'L', 'L'] },
      // Tape 1 longer than tape 2
      { currentState: 'q0', readSymbols: ['0', '_', '_'], nextState: 'q0', writeSymbols: ['0', '_', '_'], moveDirections: ['R', 'N', 'R'] },
      { currentState: 'q0', readSymbols: ['1', '_', '_'], nextState: 'q0', writeSymbols: ['1', '_', '_'], moveDirections: ['R', 'N', 'R'] },
      // Tape 2 longer than tape 1
      { currentState: 'q0', readSymbols: ['_', '0', '_'], nextState: 'q0', writeSymbols: ['_', '0', '_'], moveDirections: ['N', 'R', 'R'] },
      { currentState: 'q0', readSymbols: ['_', '1', '_'], nextState: 'q0', writeSymbols: ['_', '1', '_'], moveDirections: ['N', 'R', 'R'] },

      // ── Phase 1 (q1): Add right-to-left, no carry ──
      // 0+0=0
      { currentState: 'q1', readSymbols: ['0', '0', '_'], nextState: 'q1', writeSymbols: ['0', '0', '0'], moveDirections: ['L', 'L', 'L'] },
      // 0+1=1
      { currentState: 'q1', readSymbols: ['0', '1', '_'], nextState: 'q1', writeSymbols: ['0', '1', '1'], moveDirections: ['L', 'L', 'L'] },
      // 1+0=1
      { currentState: 'q1', readSymbols: ['1', '0', '_'], nextState: 'q1', writeSymbols: ['1', '0', '1'], moveDirections: ['L', 'L', 'L'] },
      // 1+1=10 → write 0, carry (go to q2)
      { currentState: 'q1', readSymbols: ['1', '1', '_'], nextState: 'q2', writeSymbols: ['1', '1', '0'], moveDirections: ['L', 'L', 'L'] },
      // Both exhausted, no carry → accept
      { currentState: 'q1', readSymbols: ['_', '_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_', '_'], moveDirections: ['N', 'N', 'N'] },
      // Tape 1 still has bits, tape 2 exhausted
      { currentState: 'q1', readSymbols: ['0', '_', '_'], nextState: 'q1', writeSymbols: ['0', '_', '0'], moveDirections: ['L', 'N', 'L'] },
      { currentState: 'q1', readSymbols: ['1', '_', '_'], nextState: 'q1', writeSymbols: ['1', '_', '1'], moveDirections: ['L', 'N', 'L'] },
      // Tape 2 still has bits, tape 1 exhausted
      { currentState: 'q1', readSymbols: ['_', '0', '_'], nextState: 'q1', writeSymbols: ['_', '0', '0'], moveDirections: ['N', 'L', 'L'] },
      { currentState: 'q1', readSymbols: ['_', '1', '_'], nextState: 'q1', writeSymbols: ['_', '1', '1'], moveDirections: ['N', 'L', 'L'] },

      // ── Phase 2 (q2): Add right-to-left, with carry ──
      // 0+0+1=1 → write 1, no carry (back to q1)
      { currentState: 'q2', readSymbols: ['0', '0', '_'], nextState: 'q1', writeSymbols: ['0', '0', '1'], moveDirections: ['L', 'L', 'L'] },
      // 0+1+1=10 → write 0, carry
      { currentState: 'q2', readSymbols: ['0', '1', '_'], nextState: 'q2', writeSymbols: ['0', '1', '0'], moveDirections: ['L', 'L', 'L'] },
      // 1+0+1=10 → write 0, carry
      { currentState: 'q2', readSymbols: ['1', '0', '_'], nextState: 'q2', writeSymbols: ['1', '0', '0'], moveDirections: ['L', 'L', 'L'] },
      // 1+1+1=11 → write 1, carry
      { currentState: 'q2', readSymbols: ['1', '1', '_'], nextState: 'q2', writeSymbols: ['1', '1', '1'], moveDirections: ['L', 'L', 'L'] },
      // Both exhausted but carry remains → write carry bit and accept
      { currentState: 'q2', readSymbols: ['_', '_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_', '1'], moveDirections: ['N', 'N', 'N'] },
      // Tape 1 still has bits, tape 2 exhausted (with carry)
      { currentState: 'q2', readSymbols: ['0', '_', '_'], nextState: 'q1', writeSymbols: ['0', '_', '1'], moveDirections: ['L', 'N', 'L'] },
      { currentState: 'q2', readSymbols: ['1', '_', '_'], nextState: 'q2', writeSymbols: ['1', '_', '0'], moveDirections: ['L', 'N', 'L'] },
      // Tape 2 still has bits, tape 1 exhausted (with carry)
      { currentState: 'q2', readSymbols: ['_', '0', '_'], nextState: 'q1', writeSymbols: ['_', '0', '1'], moveDirections: ['N', 'L', 'L'] },
      { currentState: 'q2', readSymbols: ['_', '1', '_'], nextState: 'q2', writeSymbols: ['_', '1', '0'], moveDirections: ['N', 'L', 'L'] },
    ],
  },
};

// Example 3: String Copy (2 tapes)
export const stringCopyExample: Example = {
  name: 'String Copy',
  description: 'Copies a string from tape 1 to tape 2',
  initialTapes: ['hello', ''],
  config: {
    numTapes: 2,
    states: ['q0', 'qaccept'],
    alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    tapeAlphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '_'],
    blankSymbol: '_',
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: [],
    transitions: [
      // Copy each character
      ...['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'].map(char => ({
        currentState: 'q0',
        readSymbols: [char, '_'],
        nextState: 'q0',
        writeSymbols: [char, char],
        moveDirections: ['R' as const, 'R' as const],
      })),
      // Accept when done
      { currentState: 'q0', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N' as const, 'N' as const] },
    ],
  },
};

// Example 4: Balanced Parentheses (2 tapes)
export const balancedParenthesesExample: Example = {
  name: 'Balanced Parentheses',
  description: 'Checks if parentheses are balanced using a stack simulation',
  initialTapes: ['(())', ''],
  config: {
    numTapes: 2,
    states: ['q0', 'q_pop', 'q_end', 'qaccept', 'qreject'],
    alphabet: ['(', ')'],
    tapeAlphabet: ['(', ')', 'X', '_'],
    blankSymbol: '_',
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      // ── Phase 0 (q0): Process input; head2 tracks stack top (next free position) ──

      // Push '(': write X at current stack position, advance both heads right
      { currentState: 'q0', readSymbols: ['(', '_'], nextState: 'q0', writeSymbols: ['(', 'X'], moveDirections: ['R', 'R'] },

      // Attempt to pop ')': move head1 to stay on ')', move head2 LEFT to check stack top
      { currentState: 'q0', readSymbols: [')', '_'], nextState: 'q_pop', writeSymbols: [')', '_'], moveDirections: ['N', 'L'] },

      // End of input detected: move head2 left to verify stack is empty
      { currentState: 'q0', readSymbols: ['_', '_'], nextState: 'q_end', writeSymbols: ['_', '_'], moveDirections: ['N', 'L'] },

      // ── Phase 1 (q_pop): Process closing paren after moving head2 left ──

      // Stack has matching open paren: erase X (write _), advance past ')', head2 stays on erased pos
      { currentState: 'q_pop', readSymbols: [')', 'X'], nextState: 'q0', writeSymbols: [')', '_'], moveDirections: ['R', 'N'] },

      // Stack empty on close paren: underflow error
      { currentState: 'q_pop', readSymbols: [')', '_'], nextState: 'qreject', writeSymbols: [')', '_'], moveDirections: ['N', 'N'] },

      // ── Phase 2 (q_end): Verify stack is empty when input ends ──

      // head2 moved to -1 (blank): stack was truly empty at input start → accept
      { currentState: 'q_end', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },

      // head2 sees X: unmatched open parenthesis remains → reject
      { currentState: 'q_end', readSymbols: ['_', 'X'], nextState: 'qreject', writeSymbols: ['_', 'X'], moveDirections: ['N', 'N'] },
    ],
  },
};

export const examples: Example[] = [
  stringCopyExample,
  binaryPalindromeExample,
  balancedParenthesesExample,
  binaryAdditionExample,
];