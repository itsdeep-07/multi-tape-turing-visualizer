import { Transition } from '../types/turing-machine';

export interface LanguagePreset {
  id: string;
  name: string;
  notation: string;
  description: string;
  grammarType: 'Regular' | 'CFG' | 'CSG';
  numTapes: number;
  mode: 'multi-tape' | 'multi-head';
  alphabet: string[];
  states: string[];
  initialState: string;
  acceptStates: string[];
  rejectStates: string[];
  transitions: Transition[];
  testCases: Array<{ input?: string; inputs?: string[]; shouldAccept: boolean; description: string }>;
}

export const languagePresets: LanguagePreset[] = [
  {
    id: 'anbn',
    name: 'a^n b^n',
    notation: 'L = { a^n b^n | n ≥ 1 }',
    description: 'Equal number of a\'s followed by equal number of b\'s',
    grammarType: 'CFG',
    numTapes: 2,
    mode: 'multi-tape',
    alphabet: ['a', 'b'],
    states: ['q0', 'q1', 'qaccept', 'qreject'],
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      { currentState: 'q0', readSymbols: ['a', '_'], nextState: 'q0', writeSymbols: ['a', 'X'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['b', '_'], nextState: 'q1', writeSymbols: ['b', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'q1', readSymbols: ['b', 'X'], nextState: 'q1', writeSymbols: ['b', '_'], moveDirections: ['R', 'L'] },
      { currentState: 'q1', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
      { currentState: 'q1', readSymbols: ['_', 'X'], nextState: 'qreject', writeSymbols: ['_', 'X'], moveDirections: ['N', 'N'] },
    ],
    testCases: [
      { input: 'ab', shouldAccept: true, description: 'n=1' },
      { input: 'aabb', shouldAccept: true, description: 'n=2' },
      { input: 'aab', shouldAccept: false, description: 'Unequal a and b' },
    ],
  },
  {
    id: 'palindrome',
    name: 'Palindrome',
    notation: 'L = { w w^R | w ∈ {a,b}* }',
    description: 'Classic single tape execution simulated with 2 tapes. Copies string, unwinds T1 to start, compares simultaneously.',
    grammarType: 'CFG',
    numTapes: 2,
    mode: 'multi-tape',
    alphabet: ['a', 'b'],
    states: ['q0_copy', 'q1_rewind', 'q2_compare', 'qaccept', 'qreject'],
    initialState: 'q0_copy',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      // Phase 1: Copy T1 to T2. Both End up at the 'end' of the string.
      { currentState: 'q0_copy', readSymbols: ['a', '_'], nextState: 'q0_copy', writeSymbols: ['a', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q0_copy', readSymbols: ['b', '_'], nextState: 'q0_copy', writeSymbols: ['b', 'b'], moveDirections: ['R', 'R'] },
      
      // Hit blank at end of T1 string. Step back left over the string.
      { currentState: 'q0_copy', readSymbols: ['_', '_'], nextState: 'q1_rewind', writeSymbols: ['_', '_'], moveDirections: ['L', 'L'] },
      
      // Phase 2: Rewind T1 fully to the start. Leave T2 at the very end of the string.
      { currentState: 'q1_rewind', readSymbols: ['a', 'a'], nextState: 'q1_rewind', writeSymbols: ['a', 'a'], moveDirections: ['L', 'N'] },
      { currentState: 'q1_rewind', readSymbols: ['a', 'b'], nextState: 'q1_rewind', writeSymbols: ['a', 'b'], moveDirections: ['L', 'N'] },
      { currentState: 'q1_rewind', readSymbols: ['b', 'a'], nextState: 'q1_rewind', writeSymbols: ['b', 'a'], moveDirections: ['L', 'N'] },
      { currentState: 'q1_rewind', readSymbols: ['b', 'b'], nextState: 'q1_rewind', writeSymbols: ['b', 'b'], moveDirections: ['L', 'N'] },

      // T1 hit the blank before the start of the string! It steps right to firmly plant on index(0).
      { currentState: 'q1_rewind', readSymbols: ['_', 'a'], nextState: 'q2_compare', writeSymbols: ['_', 'a'], moveDirections: ['R', 'N'] },
      { currentState: 'q1_rewind', readSymbols: ['_', 'b'], nextState: 'q2_compare', writeSymbols: ['_', 'b'], moveDirections: ['R', 'N'] },

      // Phase 3: Walk towards each other (T1 reads Left-to-Right, T2 reads Right-to-Left).
      { currentState: 'q2_compare', readSymbols: ['a', 'a'], nextState: 'q2_compare', writeSymbols: ['a', 'a'], moveDirections: ['R', 'L'] },
      { currentState: 'q2_compare', readSymbols: ['b', 'b'], nextState: 'q2_compare', writeSymbols: ['b', 'b'], moveDirections: ['R', 'L'] },
      
      // Mismatches kill the machine
      { currentState: 'q2_compare', readSymbols: ['a', 'b'], nextState: 'qreject', writeSymbols: ['a', 'b'], moveDirections: ['N', 'N'] },
      { currentState: 'q2_compare', readSymbols: ['b', 'a'], nextState: 'qreject', writeSymbols: ['b', 'a'], moveDirections: ['N', 'N'] },

      // Verified identically
      { currentState: 'q2_compare', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
      // Sub-edge case (Empty string bypasses rewind strictly)
      { currentState: 'q1_rewind', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] }
    ],
    testCases: [
      { input: 'aba', shouldAccept: true, description: 'Odd palindrome' },
      { input: 'abba', shouldAccept: true, description: 'Even palindrome' },
      { input: 'abb', shouldAccept: false, description: 'Not palindrome' },
    ],
  },
  {
    id: 'string_copy',
    name: 'String Copy',
    notation: 'T1: w -> T1: w, T2: w',
    description: 'Reads contents of Tape 1 and identically produces them onto Tape 2.',
    grammarType: 'CSG',
    numTapes: 2,
    mode: 'multi-tape',
    alphabet: ['a', 'b'],
    states: ['q0_copy', 'qaccept', 'qreject'],
    initialState: 'q0_copy',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      { currentState: 'q0_copy', readSymbols: ['a', '_'], nextState: 'q0_copy', writeSymbols: ['a', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q0_copy', readSymbols: ['b', '_'], nextState: 'q0_copy', writeSymbols: ['b', 'b'], moveDirections: ['R', 'R'] },
      { currentState: 'q0_copy', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
    ],
    testCases: [
      { input: 'ababa', shouldAccept: true, description: 'Copy to Tape 2' }
    ],
  },
  {
    id: 'anbncn',
    name: 'a^n b^n c^n',
    notation: 'L = { a^n b^n c^n | n ≥ 1 }',
    description: 'Equal number of a\'s, b\'s, and c\'s (Context Sensitive Grammar)',
    grammarType: 'CSG',
    numTapes: 2,
    mode: 'multi-tape',
    alphabet: ['a', 'b', 'c'],
    states: ['q0', 'qr1', 'q1', 'qr2', 'q2', 'qaccept', 'qreject'],
    initialState: 'q0',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      { currentState: 'q0', readSymbols: ['a', '_'], nextState: 'q0', writeSymbols: ['a', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q0', readSymbols: ['b', '_'], nextState: 'qr1', writeSymbols: ['b', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'qr1', readSymbols: ['b', 'a'], nextState: 'qr1', writeSymbols: ['b', 'a'], moveDirections: ['N', 'L'] },
      { currentState: 'qr1', readSymbols: ['b', '_'], nextState: 'q1', writeSymbols: ['b', '_'], moveDirections: ['N', 'R'] },
      { currentState: 'q1', readSymbols: ['b', 'a'], nextState: 'q1', writeSymbols: ['b', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q1', readSymbols: ['c', '_'], nextState: 'qr2', writeSymbols: ['c', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'qr2', readSymbols: ['c', 'a'], nextState: 'qr2', writeSymbols: ['c', 'a'], moveDirections: ['N', 'L'] },
      { currentState: 'qr2', readSymbols: ['c', '_'], nextState: 'q2', writeSymbols: ['c', '_'], moveDirections: ['N', 'R'] },
      { currentState: 'q2', readSymbols: ['c', 'a'], nextState: 'q2', writeSymbols: ['c', 'a'], moveDirections: ['R', 'R'] },
      { currentState: 'q2', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
      
      { currentState: 'q1', readSymbols: ['b', '_'], nextState: 'qreject', writeSymbols: ['b', '_'], moveDirections: ['N', 'N'] },
      { currentState: 'q1', readSymbols: ['c', 'a'], nextState: 'qreject', writeSymbols: ['c', 'a'], moveDirections: ['N', 'N'] },
      { currentState: 'q2', readSymbols: ['c', '_'], nextState: 'qreject', writeSymbols: ['c', '_'], moveDirections: ['N', 'N'] },
      { currentState: 'q2', readSymbols: ['_', 'a'], nextState: 'qreject', writeSymbols: ['_', 'a'], moveDirections: ['N', 'N'] }
    ],
    testCases: [
      { input: 'aabbcc', shouldAccept: true, description: 'n=2' },
      { input: 'aabbc', shouldAccept: false, description: 'Unequal c' },
    ],
  },
  {
    id: 'palindrome_multihead',
    name: 'Palindrome (Shared Memory)',
    notation: 'L = { w w^R | w ∈ {0,1}* }',
    description: 'Uses 2 heads on a single tape. H2 races to the end, then they walk towards each other comparing cells instantly.',
    grammarType: 'CFG',
    numTapes: 2, 
    mode: 'multi-head',
    alphabet: ['0', '1'],
    states: ['q0_setup', 'q1_rewind', 'q2_compare', 'qaccept', 'qreject'],
    initialState: 'q0_setup',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      // Phase 1: H2 moves to end of string, H1 stays at start. They initially both sit on cell 0.
      { currentState: 'q0_setup', readSymbols: ['0', '0'], nextState: 'q0_setup', writeSymbols: ['0', '0'], moveDirections: ['N', 'R'] },
      { currentState: 'q0_setup', readSymbols: ['0', '1'], nextState: 'q0_setup', writeSymbols: ['0', '1'], moveDirections: ['N', 'R'] },
      { currentState: 'q0_setup', readSymbols: ['1', '0'], nextState: 'q0_setup', writeSymbols: ['1', '0'], moveDirections: ['N', 'R'] },
      { currentState: 'q0_setup', readSymbols: ['1', '1'], nextState: 'q0_setup', writeSymbols: ['1', '1'], moveDirections: ['N', 'R'] },
      
      // H2 hit a blank, meaning it's past the string. Step back left over the last char.
      { currentState: 'q0_setup', readSymbols: ['0', '_'], nextState: 'q2_compare', writeSymbols: ['0', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'q0_setup', readSymbols: ['1', '_'], nextState: 'q2_compare', writeSymbols: ['1', '_'], moveDirections: ['N', 'L'] },
      // Edge case: Empty string
      { currentState: 'q0_setup', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },

      // Phase 2: Compare
      // Match found at both ends. H1 steps right, H2 steps left.
      { currentState: 'q2_compare', readSymbols: ['0', '0'], nextState: 'q2_compare', writeSymbols: ['0', '0'], moveDirections: ['R', 'L'] },
      { currentState: 'q2_compare', readSymbols: ['1', '1'], nextState: 'q2_compare', writeSymbols: ['1', '1'], moveDirections: ['R', 'L'] },
      
      // Mismatch!
      { currentState: 'q2_compare', readSymbols: ['0', '1'], nextState: 'qreject', writeSymbols: ['0', '1'], moveDirections: ['N', 'N'] },
      { currentState: 'q2_compare', readSymbols: ['1', '0'], nextState: 'qreject', writeSymbols: ['1', '0'], moveDirections: ['N', 'N'] },

      // If they cross paths or meet at blanks, it's fully verified!
      { currentState: 'q2_compare', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
      { currentState: 'q2_compare', readSymbols: ['_', '0'], nextState: 'qaccept', writeSymbols: ['_', '0'], moveDirections: ['N', 'N'] },
      { currentState: 'q2_compare', readSymbols: ['_', '1'], nextState: 'qaccept', writeSymbols: ['_', '1'], moveDirections: ['N', 'N'] },
      { currentState: 'q2_compare', readSymbols: ['0', '_'], nextState: 'qaccept', writeSymbols: ['0', '_'], moveDirections: ['N', 'N'] },
      { currentState: 'q2_compare', readSymbols: ['1', '_'], nextState: 'qaccept', writeSymbols: ['1', '_'], moveDirections: ['N', 'N'] },
    ],
    testCases: [
      { input: '1001', shouldAccept: true, description: 'Even Length' },
      { input: '10101', shouldAccept: true, description: 'Odd Length' }
    ],
  },
  {
    id: 'binary_addition_multihead',
    name: 'Binary Increment (2-Head)',
    notation: 'Memory Address Scanning',
    description: 'H1 remains safely at the start. H2 reads to the end of the binary string and increments it (+1) carrying leftwards.',
    grammarType: 'CSG',
    numTapes: 2, 
    mode: 'multi-head',
    alphabet: ['0', '1'],
    states: ['q_find_end', 'q_carry', 'qaccept', 'qreject'],
    initialState: 'q_find_end',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      // H2 races right
      { currentState: 'q_find_end', readSymbols: ['0', '0'], nextState: 'q_find_end', writeSymbols: ['0', '0'], moveDirections: ['N', 'R'] },
      { currentState: 'q_find_end', readSymbols: ['0', '1'], nextState: 'q_find_end', writeSymbols: ['0', '1'], moveDirections: ['N', 'R'] },
      { currentState: 'q_find_end', readSymbols: ['1', '0'], nextState: 'q_find_end', writeSymbols: ['1', '0'], moveDirections: ['N', 'R'] },
      { currentState: 'q_find_end', readSymbols: ['1', '1'], nextState: 'q_find_end', writeSymbols: ['1', '1'], moveDirections: ['N', 'R'] },
      
      // H2 hits end. Step left to begin carrying.
      { currentState: 'q_find_end', readSymbols: ['0', '_'], nextState: 'q_carry', writeSymbols: ['0', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'q_find_end', readSymbols: ['1', '_'], nextState: 'q_carry', writeSymbols: ['1', '_'], moveDirections: ['N', 'L'] },
      
      // H2 adds 1. If 1, turns to 0 and carries left.
      { currentState: 'q_carry', readSymbols: ['0', '1'], nextState: 'q_carry', writeSymbols: ['0', '0'], moveDirections: ['N', 'L'] },
      { currentState: 'q_carry', readSymbols: ['1', '1'], nextState: 'q_carry', writeSymbols: ['1', '0'], moveDirections: ['N', 'L'] },
      
      // H2 hits a 0 or blank, turns it to 1, done!
      { currentState: 'q_carry', readSymbols: ['0', '0'], nextState: 'qaccept', writeSymbols: ['0', '1'], moveDirections: ['N', 'N'] },
      { currentState: 'q_carry', readSymbols: ['1', '0'], nextState: 'qaccept', writeSymbols: ['1', '1'], moveDirections: ['N', 'N'] },
      { currentState: 'q_carry', readSymbols: ['0', '_'], nextState: 'qaccept', writeSymbols: ['0', '1'], moveDirections: ['N', 'N'] },
      { currentState: 'q_carry', readSymbols: ['1', '_'], nextState: 'qaccept', writeSymbols: ['1', '1'], moveDirections: ['N', 'N'] },
    ],
    testCases: [
      { input: '1011', shouldAccept: true, description: '1011 + 1 = 1100' }
    ],
  },
  {
    id: 'reverse_string_multihead',
    name: 'Fast String Reverse (2-Head)',
    notation: 'Transform w -> w^R',
    description: 'H2 races to end. They walk towards center, swapping and capitalizing letters. Once they hit blanks, they sweep back to uncapitalize everything!',
    grammarType: 'CSG',
    numTapes: 2, 
    mode: 'multi-head',
    alphabet: ['a', 'b', 'A', 'B'],
    states: ['q_find_end', 'q_swap', 'q_cleanup', 'qaccept', 'qreject'],
    initialState: 'q_find_end',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      // Race H2 to the blank
      { currentState: 'q_find_end', readSymbols: ['a', 'a'], nextState: 'q_find_end', writeSymbols: ['a', 'a'], moveDirections: ['N', 'R'] },
      { currentState: 'q_find_end', readSymbols: ['a', 'b'], nextState: 'q_find_end', writeSymbols: ['a', 'b'], moveDirections: ['N', 'R'] },
      { currentState: 'q_find_end', readSymbols: ['b', 'a'], nextState: 'q_find_end', writeSymbols: ['b', 'a'], moveDirections: ['N', 'R'] },
      { currentState: 'q_find_end', readSymbols: ['b', 'b'], nextState: 'q_find_end', writeSymbols: ['b', 'b'], moveDirections: ['N', 'R'] },
      
      // Step H2 left onto the final char.
      { currentState: 'q_find_end', readSymbols: ['a', '_'], nextState: 'q_swap', writeSymbols: ['a', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'q_find_end', readSymbols: ['b', '_'], nextState: 'q_swap', writeSymbols: ['b', '_'], moveDirections: ['N', 'L'] },
      { currentState: 'q_find_end', readSymbols: ['_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_'], moveDirections: ['N', 'N'] },
      
      // Swap symbols, and CAPITALIZE them to leave a marker.
      { currentState: 'q_swap', readSymbols: ['a', 'a'], nextState: 'q_swap', writeSymbols: ['A', 'A'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['b', 'b'], nextState: 'q_swap', writeSymbols: ['B', 'B'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['a', 'b'], nextState: 'q_swap', writeSymbols: ['B', 'A'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['b', 'a'], nextState: 'q_swap', writeSymbols: ['A', 'B'], moveDirections: ['R', 'L'] },
      
      // Pass over already swapped capitals effortlessly out to the blanks
      { currentState: 'q_swap', readSymbols: ['A', 'A'], nextState: 'q_swap', writeSymbols: ['A', 'A'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['A', 'B'], nextState: 'q_swap', writeSymbols: ['A', 'B'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['B', 'A'], nextState: 'q_swap', writeSymbols: ['B', 'A'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['B', 'B'], nextState: 'q_swap', writeSymbols: ['B', 'B'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['A', 'a'], nextState: 'q_swap', writeSymbols: ['A', 'a'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['B', 'b'], nextState: 'q_swap', writeSymbols: ['B', 'b'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['a', 'A'], nextState: 'q_swap', writeSymbols: ['a', 'A'], moveDirections: ['R', 'L'] },
      { currentState: 'q_swap', readSymbols: ['b', 'B'], nextState: 'q_swap', writeSymbols: ['b', 'B'], moveDirections: ['R', 'L'] },

      // Hit blanks! Reverse directions and start cleaning up!
      { currentState: 'q_swap', readSymbols: ['_', '_'], nextState: 'q_cleanup', writeSymbols: ['_', '_'], moveDirections: ['L', 'R'] },

      // Cleanup Phase
      { currentState: 'q_cleanup', readSymbols: ['A', 'A'], nextState: 'q_cleanup', writeSymbols: ['a', 'a'], moveDirections: ['L', 'R'] },
      { currentState: 'q_cleanup', readSymbols: ['A', 'B'], nextState: 'q_cleanup', writeSymbols: ['a', 'b'], moveDirections: ['L', 'R'] },
      { currentState: 'q_cleanup', readSymbols: ['B', 'A'], nextState: 'q_cleanup', writeSymbols: ['b', 'a'], moveDirections: ['L', 'R'] },
      { currentState: 'q_cleanup', readSymbols: ['B', 'B'], nextState: 'q_cleanup', writeSymbols: ['b', 'b'], moveDirections: ['L', 'R'] },

      // Crossing paths again onto fully cleaned strings
      { currentState: 'q_cleanup', readSymbols: ['a', 'a'], nextState: 'qaccept', writeSymbols: ['a', 'a'], moveDirections: ['N', 'N'] },
      { currentState: 'q_cleanup', readSymbols: ['a', 'b'], nextState: 'qaccept', writeSymbols: ['a', 'b'], moveDirections: ['N', 'N'] },
      { currentState: 'q_cleanup', readSymbols: ['b', 'a'], nextState: 'qaccept', writeSymbols: ['b', 'a'], moveDirections: ['N', 'N'] },
      { currentState: 'q_cleanup', readSymbols: ['b', 'b'], nextState: 'qaccept', writeSymbols: ['b', 'b'], moveDirections: ['N', 'N'] },
    ],
    testCases: [
      { input: 'abaabb', shouldAccept: true, description: 'Reverse into bbaaba' }
    ],
  },
  {
    id: 'binary_add_multitape',
    name: 'Binary Addition',
    notation: 'T1 + T2 = T3',
    description: 'Races 2 tapes to their ends, then walks left adding them dynamically onto Tape 3.',
    grammarType: 'CSG',
    numTapes: 3, 
    mode: 'multi-tape',
    alphabet: ['0', '1'],
    states: ['q_find_end', 'q_add_0', 'q_add_1', 'q_shift_res', 'qaccept', 'qreject'],
    initialState: 'q_find_end',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      // Race to ends
      { currentState: 'q_find_end', readSymbols: ['0', '0', '_'], nextState: 'q_find_end', writeSymbols: ['0', '0', '_'], moveDirections: ['R', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['0', '1', '_'], nextState: 'q_find_end', writeSymbols: ['0', '1', '_'], moveDirections: ['R', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['1', '0', '_'], nextState: 'q_find_end', writeSymbols: ['1', '0', '_'], moveDirections: ['R', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['1', '1', '_'], nextState: 'q_find_end', writeSymbols: ['1', '1', '_'], moveDirections: ['R', 'R', 'N'] },
      
      // Let lagging tape catch up
      { currentState: 'q_find_end', readSymbols: ['_', '0', '_'], nextState: 'q_find_end', writeSymbols: ['_', '0', '_'], moveDirections: ['N', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['_', '1', '_'], nextState: 'q_find_end', writeSymbols: ['_', '1', '_'], moveDirections: ['N', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['0', '_', '_'], nextState: 'q_find_end', writeSymbols: ['0', '_', '_'], moveDirections: ['R', 'N', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['1', '_', '_'], nextState: 'q_find_end', writeSymbols: ['1', '_', '_'], moveDirections: ['R', 'N', 'N'] },
      
      // Step back onto string
      { currentState: 'q_find_end', readSymbols: ['_', '_', '_'], nextState: 'q_add_0', writeSymbols: ['_', '_', '_'], moveDirections: ['L', 'L', 'N'] },
      
      // ADDITION: Carry 0
      { currentState: 'q_add_0', readSymbols: ['0', '0', '_'], nextState: 'q_add_0', writeSymbols: ['0', '0', '0'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_add_0', readSymbols: ['0', '1', '_'], nextState: 'q_add_0', writeSymbols: ['0', '1', '1'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_add_0', readSymbols: ['1', '0', '_'], nextState: 'q_add_0', writeSymbols: ['1', '0', '1'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_add_0', readSymbols: ['1', '1', '_'], nextState: 'q_add_1', writeSymbols: ['1', '1', '0'], moveDirections: ['L', 'L', 'L'] },
      
      { currentState: 'q_add_0', readSymbols: ['0', '_', '_'], nextState: 'q_add_0', writeSymbols: ['0', '_', '0'], moveDirections: ['L', 'N', 'L'] },
      { currentState: 'q_add_0', readSymbols: ['1', '_', '_'], nextState: 'q_add_0', writeSymbols: ['1', '_', '1'], moveDirections: ['L', 'N', 'L'] },
      { currentState: 'q_add_0', readSymbols: ['_', '0', '_'], nextState: 'q_add_0', writeSymbols: ['_', '0', '0'], moveDirections: ['N', 'L', 'L'] },
      { currentState: 'q_add_0', readSymbols: ['_', '1', '_'], nextState: 'q_add_0', writeSymbols: ['_', '1', '1'], moveDirections: ['N', 'L', 'L'] },
      
      // ADDITION: Carry 1
      { currentState: 'q_add_1', readSymbols: ['0', '0', '_'], nextState: 'q_add_0', writeSymbols: ['0', '0', '1'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_add_1', readSymbols: ['0', '1', '_'], nextState: 'q_add_1', writeSymbols: ['0', '1', '0'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_add_1', readSymbols: ['1', '0', '_'], nextState: 'q_add_1', writeSymbols: ['1', '0', '0'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_add_1', readSymbols: ['1', '1', '_'], nextState: 'q_add_1', writeSymbols: ['1', '1', '1'], moveDirections: ['L', 'L', 'L'] },
      
      { currentState: 'q_add_1', readSymbols: ['0', '_', '_'], nextState: 'q_add_1', writeSymbols: ['0', '_', '0'], moveDirections: ['L', 'N', 'L'] },
      { currentState: 'q_add_1', readSymbols: ['1', '_', '_'], nextState: 'q_add_1', writeSymbols: ['1', '_', '1'], moveDirections: ['L', 'N', 'L'] },
      { currentState: 'q_add_1', readSymbols: ['_', '0', '_'], nextState: 'q_add_1', writeSymbols: ['_', '0', '0'], moveDirections: ['N', 'L', 'L'] },
      { currentState: 'q_add_1', readSymbols: ['_', '1', '_'], nextState: 'q_add_1', writeSymbols: ['_', '1', '1'], moveDirections: ['N', 'L', 'L'] },
      
      // Finish
      { currentState: 'q_add_0', readSymbols: ['_', '_', '_'], nextState: 'q_shift_res', writeSymbols: ['_', '_', '_'], moveDirections: ['N', 'N', 'R'] },
      // Drop final carry
      { currentState: 'q_add_1', readSymbols: ['_', '_', '_'], nextState: 'q_shift_res', writeSymbols: ['_', '_', '1'], moveDirections: ['N', 'N', 'N'] },
      
      // T3 ended up reversed on left side of tape. The output is fully valid mathematically.
      { currentState: 'q_shift_res', readSymbols: ['_', '_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_', '_'], moveDirections: ['N', 'N', 'N'] },
      { currentState: 'q_shift_res', readSymbols: ['_', '_', '0'], nextState: 'qaccept', writeSymbols: ['_', '_', '0'], moveDirections: ['N', 'N', 'N'] },
      { currentState: 'q_shift_res', readSymbols: ['_', '_', '1'], nextState: 'qaccept', writeSymbols: ['_', '_', '1'], moveDirections: ['N', 'N', 'N'] },
    ],
    testCases: [
      { inputs: ['1011', '101'], shouldAccept: true, description: '1011 + 101 = 10000' }
    ],
  },
  {
    id: 'binary_sub_multitape',
    name: 'Binary Subtraction',
    notation: 'T1 - T2 = T3 (T1 >= T2)',
    description: 'Subtracts T2 from T1, outputting the result bit-by-bit to Tape 3.',
    grammarType: 'CSG',
    numTapes: 3, 
    mode: 'multi-tape',
    alphabet: ['0', '1'],
    states: ['q_find_end', 'q_sub_0', 'q_sub_1', 'q_shift_res', 'qaccept', 'qreject'],
    initialState: 'q_find_end',
    acceptStates: ['qaccept'],
    rejectStates: ['qreject'],
    transitions: [
      // Race to ends
      { currentState: 'q_find_end', readSymbols: ['0', '0', '_'], nextState: 'q_find_end', writeSymbols: ['0', '0', '_'], moveDirections: ['R', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['0', '1', '_'], nextState: 'q_find_end', writeSymbols: ['0', '1', '_'], moveDirections: ['R', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['1', '0', '_'], nextState: 'q_find_end', writeSymbols: ['1', '0', '_'], moveDirections: ['R', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['1', '1', '_'], nextState: 'q_find_end', writeSymbols: ['1', '1', '_'], moveDirections: ['R', 'R', 'N'] },
      
      // Let lagging tape catch up
      { currentState: 'q_find_end', readSymbols: ['_', '0', '_'], nextState: 'q_find_end', writeSymbols: ['_', '0', '_'], moveDirections: ['N', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['_', '1', '_'], nextState: 'q_find_end', writeSymbols: ['_', '1', '_'], moveDirections: ['N', 'R', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['0', '_', '_'], nextState: 'q_find_end', writeSymbols: ['0', '_', '_'], moveDirections: ['R', 'N', 'N'] },
      { currentState: 'q_find_end', readSymbols: ['1', '_', '_'], nextState: 'q_find_end', writeSymbols: ['1', '_', '_'], moveDirections: ['R', 'N', 'N'] },
      
      { currentState: 'q_find_end', readSymbols: ['_', '_', '_'], nextState: 'q_sub_0', writeSymbols: ['_', '_', '_'], moveDirections: ['L', 'L', 'N'] },
      
      // SUBTRACTION: Borrow 0
      { currentState: 'q_sub_0', readSymbols: ['0', '0', '_'], nextState: 'q_sub_0', writeSymbols: ['0', '0', '0'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_sub_0', readSymbols: ['1', '0', '_'], nextState: 'q_sub_0', writeSymbols: ['1', '0', '1'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_sub_0', readSymbols: ['1', '1', '_'], nextState: 'q_sub_0', writeSymbols: ['1', '1', '0'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_sub_0', readSymbols: ['0', '1', '_'], nextState: 'q_sub_1', writeSymbols: ['0', '1', '1'], moveDirections: ['L', 'L', 'L'] },
      
      { currentState: 'q_sub_0', readSymbols: ['0', '_', '_'], nextState: 'q_sub_0', writeSymbols: ['0', '_', '0'], moveDirections: ['L', 'N', 'L'] },
      { currentState: 'q_sub_0', readSymbols: ['1', '_', '_'], nextState: 'q_sub_0', writeSymbols: ['1', '_', '1'], moveDirections: ['L', 'N', 'L'] },
      
      // SUBTRACTION: Borrow 1
      { currentState: 'q_sub_1', readSymbols: ['0', '0', '_'], nextState: 'q_sub_1', writeSymbols: ['0', '0', '1'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_sub_1', readSymbols: ['1', '0', '_'], nextState: 'q_sub_0', writeSymbols: ['1', '0', '0'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_sub_1', readSymbols: ['1', '1', '_'], nextState: 'q_sub_1', writeSymbols: ['1', '1', '1'], moveDirections: ['L', 'L', 'L'] },
      { currentState: 'q_sub_1', readSymbols: ['0', '1', '_'], nextState: 'q_sub_1', writeSymbols: ['0', '1', '0'], moveDirections: ['L', 'L', 'L'] },
      
      { currentState: 'q_sub_1', readSymbols: ['0', '_', '_'], nextState: 'q_sub_1', writeSymbols: ['0', '_', '1'], moveDirections: ['L', 'N', 'L'] },
      { currentState: 'q_sub_1', readSymbols: ['1', '_', '_'], nextState: 'q_sub_0', writeSymbols: ['1', '_', '0'], moveDirections: ['L', 'N', 'L'] },
      
      // Finish
      { currentState: 'q_sub_0', readSymbols: ['_', '_', '_'], nextState: 'qaccept', writeSymbols: ['_', '_', '_'], moveDirections: ['N', 'N', 'N'] },
      { currentState: 'q_sub_1', readSymbols: ['_', '_', '_'], nextState: 'qreject', writeSymbols: ['_', '_', '_'], moveDirections: ['N', 'N', 'N'] }, // Hit negative results!
    ],
    testCases: [
      { inputs: ['110', '11'], shouldAccept: true, description: '110 - 11 = 011' }
    ],
  }
];