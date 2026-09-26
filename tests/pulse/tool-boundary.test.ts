import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_TOOL_INVOCATION_BOUNDARY_CONTRACT,
  invokePulseTool,
  isPulseToolInvocable,
} from "../../src/DigitalBoostPulseToolBoundary";

import {
  PULSE_TOOL_DESCRIPTORS,
} from "../../src/DigitalBoostPulseToolRegistry";

const TOOL_IDS = [
  "pulse.diff",
  "pulse.inspect",
  "pulse.map",
  "pulse.nba",
  "pulse.orders",
  "pulse.range",
  "pulse.score",
  "pulse.stock",
  "pulse.theme",
] as const;

const CAPABILITIES =
  new Map<string, string[]>([
    [
      "pulse.inspect",
      ["context.read"],
    ],
    [
      "pulse.score",
      ["diagnostics.read"],
    ],
    [
      "pulse.map",
      ["canvas.read"],
    ],
    [
      "pulse.nba",
      ["next_step.propose"],
    ],
    [
      "pulse.orders",
      ["orders.read"],
    ],
    [
      "pulse.stock",
      ["inventory.read"],
    ],
    [
      "pulse.theme",
      ["design.propose"],
    ],
    [
      "pulse.diff",
      ["design.propose"],
    ],
    [
      "pulse.range",
      ["analytics.read"],
    ],
  ]);

function installLocalStorage(
  initial:
    Record<string, string> = {},
) {
  const values =
    new Map(
      Object.entries(
        initial,
      ),
    );

  const storage = {
    getItem(
      key: string,
    ) {
      return values.has(key)
        ? values.get(key)!
        : null;
    },

    setItem(
      key: string,
      value: string,
    ) {
      values.set(
        key,
        String(value),
      );
    },

    removeItem(
      key: string,
    ) {
      values.delete(key);
    },

    clear() {
      values.clear();
    },

    key(
      index: number,
    ) {
      return (
        [...values.keys()][
          index
        ] ??
        null
      );
    },

    get length() {
      return values.size;
    },
  };

  (
    globalThis as
      Record<
        string,
        unknown
      >
  ).localStorage =
    storage;

  return values;
}

function factsFixture() {
  installLocalStorage({
    "db-active-store-v1":
      "Nimbus",
    "db-os-range-v1":
      "7d",
    "db-os-live-v1":
      "1",
    "db-store-page-v1":
      "Inicio",
    "db-os-theme-v1":
      "nimbus",
    "db-store-canvas-v1:Inicio":
      JSON.stringify([
        {
          type: "hero",
          title:
            "La colección",
          body:
            "Una promesa.",
          cta:
            "Entrar",
        },
        {
          type: "product",
          title:
            "Producto",
          body:
            "Disponible",
          cta:
            "Comprar",
        },
      ]),
  });

  return invokePulseTool<{
    store: string;
    range: string;
    live: boolean;
    page: string;
    theme: string;
    blocks: number;
    score: number;
    [key: string]:
      unknown;
  }>({
    toolId:
      "pulse.inspect",
    purpose:
      "OBSERVE",
    requiredCapabilities:
      ["context.read"],
    input:
      {
        store:
          "Nimbus",
      },
  }).output;
}

test(
  "P0.8.2 contract is explicit",
  () => {
    assert.equal(
      PULSE_TOOL_INVOCATION_BOUNDARY_CONTRACT,
      "p0.8.2",
    );
  },
);

test(
  "P0.8.2 invokes a registered observation tool",
  () => {
    const output =
      factsFixture();

    assert.equal(
      output.store,
      "Nimbus",
    );

    assert.equal(
      output.page,
      "Inicio",
    );

    assert.equal(
      typeof output.score,
      "number",
    );
  },
);

test(
  "P0.8.2 proposal tool requires PROPOSE purpose",
  () => {
    const facts =
      factsFixture();

    assert.throws(
      () =>
        invokePulseTool({
          toolId:
            "pulse.nba",
          purpose:
            "OBSERVE",
          input:
            facts,
        }),
      /PULSE_TOOL_PURPOSE_MISMATCH/,
    );
  },
);

test(
  "P0.8.2 proposal tool can be invoked with PROPOSE",
  () => {
    const facts =
      factsFixture();

    const result =
      invokePulseTool({
        toolId:
          "pulse.nba",
        purpose:
          "PROPOSE",
        requiredCapabilities:
          [
            "next_step.propose",
          ],
        input:
          facts,
      });

    assert.equal(
      result.toolId,
      "pulse.nba",
    );

    assert.equal(
      result.purpose,
      "PROPOSE",
    );

    assert.equal(
      result.authority,
      "NONE",
    );

    assert.equal(
      result.sideEffect,
      "NONE",
    );

    assert.equal(
      result.registryValidated,
      true,
    );
  },
);

test(
  "P0.8.2 observation tools remain usable during proposal composition",
  () => {
    const result =
      invokePulseTool({
        toolId:
          "pulse.inspect",
        purpose:
          "PROPOSE",
        requiredCapabilities:
          ["context.read"],
        input:
          {
            store:
              "Nimbus",
          },
      });

    assert.equal(
      result.toolId,
      "pulse.inspect",
    );

    assert.equal(
      result.purpose,
      "PROPOSE",
    );

    assert.equal(
      result.authority,
      "NONE",
    );
  },
);

test(
  "P0.8.2 required capability mismatch fails closed",
  () => {
    assert.throws(
      () =>
        invokePulseTool({
          toolId:
            "pulse.inspect",
          purpose:
            "OBSERVE",
          requiredCapabilities:
            [
              "design.propose",
            ],
          input:
            undefined,
        }),
      /PULSE_TOOL_CAPABILITY_MISMATCH/,
    );
  },
);

test(
  "P0.8.2 unknown tool fails closed",
  () => {
    assert.throws(
      () =>
        invokePulseTool({
          toolId:
            "pulse.does-not-exist",
        }),
      /PULSE_TOOL_UNKNOWN/,
    );

    assert.equal(
      isPulseToolInvocable({
        toolId:
          "pulse.does-not-exist",
      }),
      false,
    );
  },
);

test(
  "P0.8.2 blank tool id fails closed",
  () => {
    assert.throws(
      () =>
        invokePulseTool({
          toolId:
            "   ",
        }),
      /PULSE_TOOL_ID_REQUIRED/,
    );

    assert.equal(
      isPulseToolInvocable({
        toolId:
          "   ",
      }),
      false,
    );
  },
);

test(
  "P0.8.2 all registered tools have invocation handlers",
  () => {
    installLocalStorage({
      "db-active-store-v1":
        "Nimbus",
      "db-os-range-v1":
        "7d",
      "db-os-live-v1":
        "1",
      "db-store-page-v1":
        "Inicio",
      "db-os-theme-v1":
        "nimbus",
      "db-store-canvas-v1:Inicio":
        JSON.stringify([
          {
            type: "hero",
            title:
              "La colección",
            body:
              "Una promesa.",
            cta:
              "Entrar",
          },
        ]),
    });

    const facts =
      invokePulseTool({
        toolId:
          "pulse.inspect",
        purpose:
          "OBSERVE",
        input:
          undefined,
      }).output;

    for (const descriptor of PULSE_TOOL_DESCRIPTORS) {
      const purpose =
        descriptor.kind ===
        "PROPOSAL"
          ? "PROPOSE"
          : "OBSERVE";

      let input:
        unknown =
        facts;

      if (
        descriptor.id ===
        "pulse.inspect"
      ) {
        input = {
          store:
            "Nimbus",
        };
      }

      const result =
        invokePulseTool({
          toolId:
            descriptor.id,
          purpose,
          requiredCapabilities:
            CAPABILITIES.get(
              descriptor.id,
            ),
          input,
        });

      assert.equal(
        result.toolId,
        descriptor.id,
      );

      assert.equal(
        result.implementationExport,
        descriptor.implementationExport,
      );

      assert.equal(
        result.registryValidated,
        true,
      );
    }
  },
);

test(
  "P0.8.2 invocation result does not expose handler",
  () => {
    const result =
      invokePulseTool({
        toolId:
          "pulse.score",
        purpose:
          "OBSERVE",
        requiredCapabilities:
          ["diagnostics.read"],
        input:
          factsFixture(),
      });

    assert.equal(
      "handler" in
        result,
      false,
    );

    assert.equal(
      "execute" in
        result,
      false,
    );

    assert.equal(
      "authorize" in
        result,
      false,
    );
  },
);

test(
  "P0.8.2 boundary preserves NONE authority",
  () => {
    const result =
      invokePulseTool({
        toolId:
          "pulse.theme",
        purpose:
          "PROPOSE",
        requiredCapabilities:
          ["design.propose"],
        input:
          factsFixture(),
      });

    assert.equal(
      result.authority,
      "NONE",
    );

    assert.equal(
      result.sideEffect,
      "NONE",
    );
  },
);

test(
  "P0.8.2 invocation errors fail closed",
  () => {
    assert.throws(
      () =>
        invokePulseTool({
          toolId:
            "pulse.score",
          purpose:
            "OBSERVE",
          input:
            undefined,
        }),
      /PULSE_TOOL_INVOCATION_FAILED:pulse\.score/,
    );
  },
);

test(
  "P0.8.2 required capabilities are normalized deterministically",
  () => {
    installLocalStorage();

    const result =
      invokePulseTool({
        toolId:
          "pulse.inspect",
        purpose:
          "OBSERVE",
        requiredCapabilities:
          [
            "context.read",
            "context.read",
            " ",
          ],
        input:
          undefined,
      });

    assert.equal(
      result.registryValidated,
      true,
    );
  },
);

test(
  "P0.8.2 invocability predicate never throws",
  () => {
    assert.doesNotThrow(
      () => {
        isPulseToolInvocable({
          toolId:
            "pulse.inspect",
          purpose:
            "OBSERVE",
        });

        isPulseToolInvocable({
          toolId:
            "pulse.nba",
          purpose:
            "OBSERVE",
        });

        isPulseToolInvocable({
          toolId:
            "pulse.nba",
          purpose:
            "PROPOSE",
        });
      },
    );
  },
);
