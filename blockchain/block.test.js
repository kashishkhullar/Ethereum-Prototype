const Block = require("./block");

describe("Block", () => {
	describe("calculateBlockTargetHash", () => {
		it("calculates the max hash with difficulty 1", () => {
			expect(
				Block.calculateBlockTargetHash({
					lastBlock: { blockHeaders: { difficulty: 1 } }
				})
			).toEqual("f".repeat(64));
		});

		it("calculates low hash value when difficulty is hish", () => {
			expect(
				Block.calculateBlockTargetHash({
					lastBlock: { blockHeaders: { difficulty: 500 } }
				}) < "1"
			).toBe(true);
		});
	});
});
