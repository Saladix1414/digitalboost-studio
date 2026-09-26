import test from "node:test";
import assert from "node:assert/strict";
import {
  execFileSync,
} from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ALLOWED_RAW_TOOL_FILES = new Set([
  "src/DigitalBoostPulseTools.ts",
  "src/DigitalBoostPulseToolBoundary.ts",
]);

const RAW_TOOL_MODULE =
  "DigitalBoostPulseTools";

const RAW_TOOL_CALL =
  /(^|[^A-Za-z0-9_$])tool(Inspect|ScoreLine|Map|Nba|Orders|Stock|Theme|Diff|Range)\s*\(/;

function trackedSourceFiles(): string[] {
  const raw =
    execFileSync(
      "git",
      [
        "ls-files",
        "-z",
        "--",
        "src",
      ],
      {
        encoding: "utf8",
      },
    );

  return raw
    .split("\0")
    .filter(
      (file) =>
        (file.endsWith(".ts") ||
          file.endsWith(".tsx")) &&
        !file.endsWith(".d.ts"),
    );
}

test(
  "only canonical tool implementation and boundary may reference raw tool module",
  () => {
    const files =
      trackedSourceFiles();

    const violations: string[] = [];

    for (const file of files) {
      if (
        ALLOWED_RAW_TOOL_FILES.has(
          file,
        )
      ) {
        continue;
      }

      const source =
        fs.readFileSync(
          path.resolve(file),
          "utf8",
        );

      if (
        source.includes(
          RAW_TOOL_MODULE,
        )
      ) {
        violations.push(file);
      }
    }

    assert.deepEqual(
      violations,
      [],
      [
        "Raw tool module referenced outside canonical implementation/boundary:",
        ...violations,
      ].join("\n"),
    );
  },
);

test(
  "raw tool implementations are only directly invoked by canonical boundary",
  () => {
    const files =
      trackedSourceFiles();

    const violations: string[] = [];

    for (const file of files) {
      if (
        ALLOWED_RAW_TOOL_FILES.has(
          file,
        )
      ) {
        continue;
      }

      const source =
        fs.readFileSync(
          path.resolve(file),
          "utf8",
        );

      if (RAW_TOOL_CALL.test(source)) {
        violations.push(file);
      }
    }

    assert.deepEqual(
      violations,
      [],
      [
        "Direct raw tool invocation detected outside canonical implementation/boundary:",
        ...violations,
      ].join("\n"),
    );
  },
);

test(
  "consumer adapter reaches P0.8.5 evidence and never imports raw tools",
  () => {
    const file =
      path.resolve(
        "src/DigitalBoostPulseToolConsumerAdapter.ts",
      );

    const source =
      fs.readFileSync(
        file,
        "utf8",
      );

    assert.match(
      source,
      /invokePulseToolWithEvidence/,
    );

    assert.doesNotMatch(
      source,
      /DigitalBoostPulseTools/,
    );

    assert.match(
      source,
      /PULSE_TOOL_CONSUMER_ADAPTER_CONTRACT/,
    );
  },
);

test(
  "canonical boundary remains the raw tool invocation point",
  () => {
    const file =
      path.resolve(
        "src/DigitalBoostPulseToolBoundary.ts",
      );

    const source =
      fs.readFileSync(
        file,
        "utf8",
      );

    assert.match(
      source,
      /DigitalBoostPulseTools/,
    );

    assert.match(
      source,
      /invokePulseTool/,
    );
  },
);
