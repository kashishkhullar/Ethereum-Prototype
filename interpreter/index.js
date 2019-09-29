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
const STORE = "STORE";
const LOAD = "LOAD";

const OPCODE_MAP = {
	STOP,
	ADD,
	SUB,
	MUL,
	DIV,
	PUSH,
	GT,
	LT,
	EQ,
	AND,
	OR,
	JUMP,
	JUMPI,
	STORE,
	LOAD
};

const OPCODE_GAS_MAP = {
	STOP: 0,
	ADD: 1,
	SUB: 1,
	MUL: 1,
	DIV: 1,
	PUSH: 0,
	LT: 1,
	GT: 1,
	EQ: 1,
	AND: 1,
	OR: 1,
	JUMP: 2,
	JUMPI: 2,
	STORE: 5,
	LOAD: 5
};

const EXECUTION_COMPLETE = "Execution Complete";
const EXECUTION_LIMIT = 10000;

class Interpreter {
	/**
	 * Constructor of the interpreter
	 * programCounter - starts at 0 counts the number of instrcutions ran
	 * stack - holds the instructions
	 * code - holds all the instrcutions
	 */
	constructor({ storageTrie } = {}) {
		this.state = {
			programCounter: 0,
			stack: [],
			code: [],
			executionCount: 0
		};
		this.storageTrie = storageTrie;
	}

	// runs code passed as argument
	runCode(code) {
		// assign the code to the state
		this.state.code = code;
		let gasUsed = 0;

		// run a while loop over each instruction
		while (this.state.programCounter < this.state.code.length) {
			// increment the times an instruction is executed
			this.state.executionCount++;

			if (this.state.executionCount > EXECUTION_LIMIT)
				throw new Error(
					`Check for infinite loop. Execution limit of ${EXECUTION_LIMIT} has been exceeded`
				);

			// get the current instruction in opCode variable
			const opCode = this.state.code[this.state.programCounter];

			if (
				this.state.code.length - 1 === this.state.programCounter &&
				opCode != STOP
			)
				throw new Error("STOP opcode missing");

			gasUsed += OPCODE_GAS_MAP[opCode];

			let value, key;

			try {
				switch (opCode) {
					case STOP:
						throw new Error(EXECUTION_COMPLETE);

					case PUSH:
						// increment counter to get the value to be pushed
						this.state.programCounter++;

						if (
							this.state.programCounter ===
							this.state.code.length - 1
						)
							throw new Error("Push cannot be last");
						value = this.state.code[this.state.programCounter];
						this.state.stack.push(value);
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

					case STORE:
						key = this.state.stack.pop();
						value = this.state.stack.pop();

						this.storageTrie.put({ key, value });
						break;

					case LOAD:
						key = this.state.stack.pop();
						value = this.storageTrie.get({ key });

						this.state.stack.push(value);
						break;

					// unknown opcodes are ignored

					default:
						console.log("INVALID OPCODE");
						break;
				}
			} catch (error) {
				if (error.message == EXECUTION_COMPLETE)
					return {
						gasUsed,
						result: this.state.stack[this.state.stack.length - 1]
					};

				throw error;
			}
			// increment the program counter to point to the next instruction
			this.state.programCounter++;
		}
	}

	jump() {
		let destination = this.state.stack.pop();

		if (destination < 0 || destination > this.state.code.length) {
			throw new Error(`Invalid destination: ${destination}`);
		}
		this.state.programCounter = destination;
		this.state.programCounter--;
	}
}

Interpreter.OPCODE_MAP = OPCODE_MAP;

module.exports = Interpreter;

// // Testing the interpreter

// // Addition
// let code = [PUSH, 2, PUSH, 3, ADD, STOP];
// let result = new Interpreter().runCode(code);
// console.log("Result of 3+2:", result);

// // Subtraction
// code = [PUSH, 2, PUSH, 3, SUB, STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of 3-2:", result);

// // Multiplication
// code = [PUSH, 2, PUSH, 3, MUL, STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of 3*2:", result);

// // Division
// code = [PUSH, 2, PUSH, 3, DIV, STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of 3/2:", result);

// // Less than
// code = [PUSH, 2, PUSH, 3, LT, STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of 3<2:", result);

// // greater than
// code = [PUSH, 2, PUSH, 3, GT, STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of 3>2:", result);

// // Equal
// code = [PUSH, 2, PUSH, 2, EQ, STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of 2==2:", result);

// // OR
// code = [PUSH, 1, PUSH, 0, OR, STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of 1 or 0:", result);

// // AND
// code = [PUSH, 0, PUSH, 1, AND, STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of 0 and 1:", result);

// // JUMP
// code = [PUSH, 6, JUMP, PUSH, 0, JUMP, PUSH, "jump successful.", STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of jump:", result);

// // JUMPI
// code = [PUSH, 8, PUSH, 1, JUMPI, PUSH, 0, JUMP, PUSH, "jump successful.", STOP];
// result = new Interpreter().runCode(code);

// console.log("Result of jumpI:", result);

// // INVALID JUMP
// code = [
// 	PUSH,
// 	99,
// 	PUSH,
// 	1,
// 	JUMPI,
// 	PUSH,
// 	0,
// 	JUMP,
// 	PUSH,
// 	"jumpi successful.",
// 	STOP
// ];
// try {
// 	new Interpreter().runCode(code);
// } catch (error) {
// 	console.log(error.message);
// }

// // INVALID PUSH
// code = [PUSH, 0, PUSH];
// try {
// 	console.log(new Interpreter().runCode(code));
// } catch (error) {
// 	console.log(error.message);
// }

// // INVALID PUSH
// code = [PUSH, 0, PUSH, 1];
// try {
// 	console.log(new Interpreter().runCode(code));
// } catch (error) {
// 	console.log(error.message);
// }

// // INVALID PUSH
// code = [PUSH, 0, JUMP, 1, STOP];
// try {
// 	console.log(new Interpreter().runCode(code));
// } catch (error) {
// 	console.log(error.message);
// }
