import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const componentDir = new URL(
  "../../src/trading/components/",
  import.meta.url
);

const cssSource =
  fs.readFileSync(
    new URL(
      "../../src/trading/trading-islands.css",
      import.meta.url
    ),
    "utf8"
  );

const components = [
  "WorkspaceTabs.tsx",
  "Modal.tsx",
  "Drawer.tsx",
  "CommandPalette.tsx",
  "ActivityFeed.tsx",
  "Timeline.tsx",
  "BottomConsole.tsx",
  "Toast.tsx",
];

function source(
  name: string
): string {
  return fs.readFileSync(
    new URL(name, componentDir),
    "utf8"
  );
}

test(
  "workspace primitives exist",
  () => {
    for (
      const component
      of components
    ) {
      assert.equal(
        fs.existsSync(
          new URL(
            component,
            componentDir
          )
        ),
        true,
        `missing component: ${component}`
      );
    }
  }
);

test(
  "workspace primitives remain independent from PULSE",
  () => {
    for (
      const component
      of components
    ) {
      assert.doesNotMatch(
        source(component),
        /DigitalBoostPulse|from\s+["'][^"']*Pulse/i,
        `${component} contains PULSE coupling`
      );
    }
  }
);

test(
  "modal and drawer support Escape dismissal",
  () => {
    assert.match(
      source("Modal.tsx"),
      /event\.key === "Escape"/
    );

    assert.match(
      source("Drawer.tsx"),
      /event\.key === "Escape"/
    );
  }
);

test(
  "command palette filters commands locally",
  () => {
    const content =
      source(
        "CommandPalette.tsx"
      );

    assert.match(
      content,
      /useMemo/
    );

    assert.match(
      content,
      /haystack\.includes/
    );

    assert.match(
      content,
      /Search commands/
    );
  }
);

test(
  "workspace tabs expose tab semantics",
  () => {
    const content =
      source(
        "WorkspaceTabs.tsx"
      );

    assert.match(
      content,
      /role="tablist"/
    );

    assert.match(
      content,
      /role="tab"/
    );

    assert.match(
      content,
      /aria-selected/
    );
  }
);

test(
  "bottom console supports collapse state",
  () => {
    const content =
      source(
        "BottomConsole.tsx"
      );

    assert.match(
      content,
      /collapsed/
    );

    assert.match(
      content,
      /onToggle/
    );
  }
);

test(
  "workspace CSS includes overlay and console primitives",
  () => {
    assert.match(
      cssSource,
      /\.ti-modal/
    );

    assert.match(
      cssSource,
      /\.ti-drawer/
    );

    assert.match(
      cssSource,
      /\.ti-command-palette/
    );

    assert.match(
      cssSource,
      /\.ti-bottom-console/
    );

    assert.match(
      cssSource,
      /\.ti-toast/
    );
  }
);
