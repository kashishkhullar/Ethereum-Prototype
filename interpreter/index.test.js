const Interpreter = require("./index");

const OPCODE_MAP = ({
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
	JUMPI
} = Interpreter.OPCODE_MAP);

describe("Interpreter", () => {
	describe("runCode", () => {
		describe("code with ADD", () => {
			it("should add 2 and 3", () => {
				expect(
					new Interpreter().runCode([PUSH, 2, PUSH, 3, ADD, STOP])
				).toEqual(5);
			});
		});
		describe("code with SUB", () => {
			it("should sub 2 and 3", () => {
				expect(
					new Interpreter().runCode([PUSH, 2, PUSH, 3, SUB, STOP])
				).toEqual(1);
			});
		});
		describe("code with MUL", () => {
			it("should mul 2 and 3", () => {
				expect(
					new Interpreter().runCode([PUSH, 2, PUSH, 3, MUL, STOP])
				).toEqual(6);
			});
		});
		describe("code with DIV", () => {
			it("should div 2 and 3", () => {
				expect(
					new Interpreter().runCode([PUSH, 2, PUSH, 3, DIV, STOP])
				).toEqual(1.5);
			});
		});
		describe("code with GT", () => {
			it("should check if 3 is greater than 2", () => {
				expect(
					new Interpreter().runCode([PUSH, 2, PUSH, 3, GT, STOP])
				).toEqual(1);
			});
		});
		describe("code with LT", () => {
			it("should check if 3  is less than 2", () => {
				expect(
					new Interpreter().runCode([PUSH, 2, PUSH, 3, LT, STOP])
				).toEqual(0);
			});
		});
		describe("code with EQ", () => {
			it("should check if 2 and 3 are equal", () => {
				expect(
					new Interpreter().runCode([PUSH, 2, PUSH, 3, EQ, STOP])
				).toEqual(0);
			});
		});
		describe("code with OR", () => {
			it("should OR 1 and 0", () => {
				expect(
					new Interpreter().runCode([PUSH, 1, PUSH, 0, OR, STOP])
				).toEqual(1);
			});
		});
		describe("code with AND", () => {
			it("should AND 1 and 0", () => {
				expect(
					new Interpreter().runCode([PUSH, 1, PUSH, 0, AND, STOP])
				).toEqual(0);
			});
		});
		describe("code with JUMP", () => {
			it("should JUMP", () => {
				expect(
					new Interpreter().runCode([
						PUSH,
						6,
						JUMP,
						PUSH,
						0,
						JUMP,
						PUSH,
						"jump successful.",
						STOP
					])
				).toEqual("jump successful.");
			});
		});
		describe("code with JUMP", () => {
			it("should JUMP", () => {
				expect(
					new Interpreter().runCode([
						PUSH,
						8,
						PUSH,
						1,
						JUMPI,
						PUSH,
						0,
						JUMP,
						PUSH,
						"jump successful.",
						STOP
					])
				).toEqual("jump successful.");
			});
		});
		describe("and the code includes an invalid JUMP destination", () => {
			it("throws an error", () => {
				expect(() =>
					new Interpreter().runCode([
						PUSH,
						99,
						JUMP,
						PUSH,
						0,
						JUMP,
						PUSH,
						"jump successful",
						STOP
					])
				).toThrow("Invalid destination: 99");
			});
		});

		describe("and the code includes an invalid PUSH value", () => {
			it("throws an error", () => {
				expect(() =>
					new Interpreter().runCode([PUSH, 0, PUSH])
				).toThrow("STOP opcode missing");
			});
		});

		describe("and the code missing STOP value", () => {
			it("throws an error", () => {
				expect(() =>
					new Interpreter().runCode([PUSH, 0, PUSH, 1])
				).toThrow("Push cannot be last");
			});
		});

		describe("and the code includes an infinite loop", () => {
			it("throws an error", () => {
				expect(() =>
					new Interpreter().runCode([PUSH, 0, JUMP, STOP])
				).toThrow(
					"Check for infinite loop. Execution limit of 10000 has been exceeded"
				);
			});
		});
	});
});
