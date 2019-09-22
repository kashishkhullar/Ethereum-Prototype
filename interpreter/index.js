const STOP = "STOP";
const ADD = "ADD";
const SUB = "SUB";
const MUL = "MUL";
const DIV = "DIV";
const PUSH = "PUSH";
const GT = "GT";
const LT = "LT";
const EQ = "EQ";
const AND = "AND";
const OR = "OR";
const JUMP = "JUMP";
const JUMPI = "JUMPI";

const EXECUTION_COMPLETE = "Execution Complete";

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
						throw new Error(EXECUTION_COMPLETE);

					case PUSH:
						// increment counter to get the value to be pushed
						this.state.programCounter++;
						this.state.stack.push(
							this.state.code[this.state.programCounter]
						);
						break;

					// Stack the 4 main operations since most of the code is common
					case ADD:
					case SUB:
					case MUL:
					case DIV:
					case EQ:
					case LT:
					case GT:
					case OR:
					case AND:
						// get the to operands to be pushed from the stack
						const a = this.state.stack.pop();
						const b = this.state.stack.pop();

						// store the result of the operation
						let result;

						// compute the result based on the opcode
						if (opCode === ADD) result = a + b;
						if (opCode === SUB) result = a - b;
						if (opCode === MUL) result = a * b;
						if (opCode === DIV) result = a / b;
						if (opCode === LT) result = a < b ? 1 : 0;
						if (opCode === GT) result = a > b ? 1 : 0;
						if (opCode === EQ) result = a === b ? 1 : 0;
						if (opCode === AND) result = a && b;
						if (opCode === OR) result = a || b;
						this.state.stack.push(result);

						break;

					case JUMP:
						this.jump();
						break;

					case JUMPI:
						let condition = this.state.stack.pop();
						if (condition === 1) {
							this.jump();
						}
						break;

					// unknown opcodes are ignored
					default:
						console.log("INVALID OPCODE");
						break;
				}
			} catch (error) {
				if (error.message == EXECUTION_COMPLETE)
					return this.state.stack[this.state.stack.length - 1];

				throw error;
			}
			// increment the program counter to point to the next instruction
			this.state.programCounter++;
		}
	}

	jump() {
		let destination = this.state.stack.pop();

		if (destination < 0 || destination > this.state.code.length) {
			throw new error(`Invalid destination: ${destination}`);
		}
		this.state.programCounter = destination;
		this.state.programCounter--;
	}
}

// Testing the interpreter

// Addition
let code = [PUSH, 2, PUSH, 3, ADD, STOP];
let result = new Interpreter().runCode(code);
console.log("Result of 3+2:", result);

// Subtraction
code = [PUSH, 2, PUSH, 3, SUB, STOP];
result = new Interpreter().runCode(code);

console.log("Result of 3-2:", result);

// Multiplication
code = [PUSH, 2, PUSH, 3, MUL, STOP];
result = new Interpreter().runCode(code);

console.log("Result of 3*2:", result);

// Division
code = [PUSH, 2, PUSH, 3, DIV, STOP];
result = new Interpreter().runCode(code);

console.log("Result of 3/2:", result);

// Less than
code = [PUSH, 2, PUSH, 3, LT, STOP];
result = new Interpreter().runCode(code);

console.log("Result of 3<2:", result);

// greater than
code = [PUSH, 2, PUSH, 3, GT, STOP];
result = new Interpreter().runCode(code);

console.log("Result of 3>2:", result);

// Equal
code = [PUSH, 2, PUSH, 2, EQ, STOP];
result = new Interpreter().runCode(code);

console.log("Result of 2==2:", result);

// OR
code = [PUSH, 1, PUSH, 0, OR, STOP];
result = new Interpreter().runCode(code);

console.log("Result of 1 or 0:", result);

// AND
code = [PUSH, 0, PUSH, 1, AND, STOP];
result = new Interpreter().runCode(code);

console.log("Result of 0 and 1:", result);

// JUMP
code = [PUSH, 6, JUMP, PUSH, 0, JUMP, PUSH, "jump successful.", STOP];
result = new Interpreter().runCode(code);

console.log("Result of jump:", result);

// JUMPI
code = [PUSH, 8, PUSH, 1, JUMPI, PUSH, 0, JUMP, PUSH, "jump successful.", STOP];
result = new Interpreter().runCode(code);

console.log("Result of jumpI:", result);
