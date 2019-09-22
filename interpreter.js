const STOP = "STOP";
const ADD = "ADD";
const PUSH = "PUSH";

const code = [PUSH, 2, PUSH, 3, ADD, STOP];

class Interpreter {
  /**
   * Constructor of the interpreter
   * programCounter - starts at 0 counts the number of instrcutions ran
   * stack - holds the instructions
   * code - holds all the instrcutions
   */
  constructor() {
    this.state = {
      programCounter: 0,
      stack: [],
      code: []
    };
  }

  // runs code passed as argument
  runCode(code) {
    // assign the code to the state
    this.state.code = code;

    // run a while loop over each instruction
    while (this.state.programCounter < this.state.code.length) {
      // get the current instruction in opCode variable
      const opCode = this.state.code[this.state.programCounter];

      try {
        switch (opCode) {
          case STOP:
            throw new Error("Execution is complete");
          case PUSH:
            // increment counter to get the value to be pushed
            this.state.programCounter++;
            this.state.stack.push(this.state.code[this.state.programCounter]);
            break;
          case ADD:
            // get the to operands to be pushed from the stack
            const a = this.state.stack.pop();
            const b = this.state.stack.pop();
            this.state.stack.push(a + b);

            break;
          default:
            break;
        }
      } catch (error) {
        return this.state.stack[this.state.stack.length - 1];
      }

      // increment the program counter to point to the next instruction
      this.state.programCounter++;
    }
  }
}

const interpreter = new Interpreter();
console.log(interpreter.runCode(code));
