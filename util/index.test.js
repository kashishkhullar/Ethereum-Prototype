const { sortCharacters } = require("./index");

describe("util", () => {
	describe("sortCharacters()", () => {
		it("creates the same string ", () => {
			expect(sortCharacters({ foo: "foo", bar: "bar" })).toEqual(
				sortCharacters({ bar: "bar", foo: "foo" })
			);
		});

		it("creates a different string", () => {
			expect(sortCharacters({ foo: "faa", bar: "bar" })).not.toEqual(
				sortCharacters({ bar: "bar", foo: "foo" })
			);
		});
	});
});
