import { validate } from "package-json-validator";

import { createRule } from "../createRule.js";

// package-json-validator does not correctly recognize shorthand for repositories and alternate dependency statements, so we discard those values.
// it also enforces a stricter code for npm than is really appropriate,
// so we disable some other errors here.
const ignoredErrors = [
	/^Url not valid/i,
	/^Invalid version range for .+?: file:/i,
	/^author field should have name/i,
];

const isUsableError = (errorText: string) =>
	ignoredErrors.every((pattern) => !pattern.test(errorText));

export const rule = createRule({
	create(context) {
		return {
			"Program:exit"() {
				const validation = validate(context.sourceCode.text);

				validation.errors?.filter(isUsableError).forEach((message) => {
					if (message) {
						context.report({
							// eslint-disable-next-line eslint-plugin/prefer-message-ids
							message,
							node: context.sourceCode.ast,
						});
					}
				});
			},
		};
	},

	// eslint-disable-next-line eslint-plugin/prefer-message-ids
	meta: {
		docs: {
			category: "Best Practices",
			description:
				"Enforce that package.json has all properties required by the npm spec",
			recommended: true,
		},
		schema: [],
		type: "problem",
	},
});
