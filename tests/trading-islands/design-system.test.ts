import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const componentDir = new URL(
  "../../src/trading/components/",
  import.meta.url
);

const cssSource = fs.readFileSync(
  new URL(
    "../../src/trading/trading-islands.css",
    import.meta.url
  ),
  "utf8"
);

const requiredComponents = [
  "ActionButton.tsx",
  "StatusBadge.tsx",
  "MetricCard.tsx",
  "DataTable.tsx",
  "ChartPanel.tsx",
  "Toolbar.tsx",
  "FilterBar.tsx",
  "EmptyState.tsx",
  "Skeleton.tsx",
  "index.ts",
];

function source(name: string): string {
  return fs.readFileSync(
    new URL(name, componentDir),
    "utf8"
  );
}

test(
  "Trading Islands core design-system components exist",
  () => {
    for (const component of requiredComponents) {
      assert.equal(
        fs.existsSync(
          new URL(component, componentDir)
        ),
        true,
        `missing component: ${component}`
      );
    }
  }
);

test(
  "Trading Islands design system remains isolated from PULSE",
  () => {
    for (const component of requiredComponents) {
      const content = source(component);

      assert.doesNotMatch(
        content,
        /DigitalBoostPulse|from\s+["'][^"']*Pulse/i,
        `${component} contains a PULSE dependency`
      );
    }
  }
);

test(
  "ActionButton supports explicit visual variants",
  () => {
    const content = source(
      "ActionButton.tsx"
    );

    for (const variant of [
      "default",
      "primary",
      "danger",
      "ghost",
    ]) {
      assert.match(
        content,
        new RegExp(
          `["']${variant}["']`
        )
      );
    }
  }
);

test(
  "DataTable supports keyboard-accessible rows",
  () => {
    const content = source(
      "DataTable.tsx"
    );

    assert.match(
      content,
      /tabIndex/
    );

    assert.match(
      content,
      /event\.key === "Enter"/
    );

    assert.match(
      content,
      /event\.key === " "/
    );
  }
);

test(
  "Design system contains responsive and reduced-motion behavior",
  () => {
    assert.match(
      cssSource,
      /prefers-reduced-motion/
    );

    assert.match(
      cssSource,
      /@media \(max-width: 720px\)/
    );
  }
);

test(
  "Positive and negative semantics remain separate",
  () => {
    assert.match(
      cssSource,
      /--ti-positive/
    );

    assert.match(
      cssSource,
      /--ti-negative/
    );

    assert.match(
      cssSource,
      /\.ti-metric-card--positive/
    );

    assert.match(
      cssSource,
      /\.ti-metric-card--negative/
    );
  }
);
