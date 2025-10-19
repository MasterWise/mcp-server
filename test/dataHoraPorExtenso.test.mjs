import test from "node:test";
import assert from "node:assert/strict";

import { dataHoraPorExtenso, horaAtualBrasiliaOutputSchema } from "../server.mjs";

test("dataHoraPorExtenso matches the horaAtualBrasilia schema", () => {
  const out = dataHoraPorExtenso();
  const parseResult = horaAtualBrasiliaOutputSchema.safeParse(out);
  assert.equal(parseResult.success, true, () => JSON.stringify(parseResult.error?.format(), null, 2));

  // sanity checks on ISO date and timezone consistency
  assert.equal(out.timeZone, "America/Sao_Paulo");
  assert.doesNotThrow(() => new Date(out.iso));
});
