import {
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  CircleDot,
  Import,
  Sparkles,
  Waves,
} from "lucide-react";

import {
  captureNftOrigin,
} from "./captureEngine";

import {
  classicOriginCaptureFixture,
  generativeOriginCaptureFixture,
  importedOriginCaptureFixture,
  livingOriginCaptureFixture,
} from "./captureFixtures";

import type {
  NftOriginMode,
} from "./types";

type ModeEntry = {
  readonly mode:
    NftOriginMode;

  readonly label:
    string;

  readonly description:
    string;

  readonly icon:
    typeof Boxes;
};

const modes:
  readonly ModeEntry[] = [
    {
      mode:
        "CLASSIC",

      label:
        "Classic",

      description:
        "Manual or Forge-based asset creation.",

      icon:
        Boxes,
    },

    {
      mode:
        "GENERATIVE",

      label:
        "Generative",

      description:
        "Deterministic generator + seed + ruleset.",

      icon:
        Sparkles,
    },

    {
      mode:
        "LIVING",

      label:
        "Living",

      description:
        "State-aware asset prepared for controlled evolution.",

      icon:
        Waves,
    },

    {
      mode:
        "IMPORTED",

      label:
        "Imported",

      description:
        "External asset captured into Origin context.",

      icon:
        Import,
    },
  ];

function fixtureForMode(
  mode:
    NftOriginMode
) {
  switch (mode) {
    case "CLASSIC":
      return classicOriginCaptureFixture;

    case "GENERATIVE":
      return generativeOriginCaptureFixture;

    case "LIVING":
      return livingOriginCaptureFixture;

    case "IMPORTED":
      return importedOriginCaptureFixture;
  }
}

export function NftOriginModesWorkspace() {
  const [
    activeMode,
    setActiveMode,
  ] =
    useState<NftOriginMode>(
      "CLASSIC"
    );

  const selected =
    useMemo(
      () =>
        fixtureForMode(
          activeMode
        ),
      [activeMode]
    );

  const capture =
    useMemo(
      () =>
        captureNftOrigin(
          selected
        ),
      [selected]
    );

  return (
    <section
      className="ti-origin-modes"
      data-origin-modes
      data-authority="none"
    >
      <header className="ti-origin-modes__hero">
        <div>
          <span className="ti-label">
            Origin Modes
          </span>

          <h3>
            Mode-aware creation context
          </h3>

          <p>
            Inspect how each Origin mode
            configures deterministic capture
            without turning creation context
            into provenance or ownership.
          </p>
        </div>

        <CircleDot
          size={22}
          strokeWidth={1.4}
        />
      </header>

      <nav
        className="ti-origin-modes__tabs"
        aria-label="NFT Origin modes"
      >
        {modes.map(
          ({
            mode,
            label,
            icon: Icon,
          }) => (
            <button
              key={mode}
              type="button"
              className={
                activeMode === mode
                  ? "is-active"
                  : ""
              }
              aria-current={
                activeMode === mode
                  ? "page"
                  : undefined
              }
              onClick={() =>
                setActiveMode(
                  mode
                )
              }
            >
              <Icon
                size={14}
                strokeWidth={1.6}
              />

              {label}
            </button>
          )
        )}
      </nav>

      <div className="ti-origin-modes__layout">
        <section className="ti-origin-modes__profile">
          <header>
            <div>
              <span>
                Mode profile
              </span>

              <strong>
                {activeMode}
              </strong>
            </div>

            <small>
              deterministic
            </small>
          </header>

          <p>
            {
              modes.find(
                (entry) =>
                  entry.mode ===
                  activeMode
              )?.description
            }
          </p>

          <dl>
            <div>
              <dt>
                Asset
              </dt>

              <dd>
                {selected.assetId}
              </dd>
            </div>

            <div>
              <dt>
                Collection
              </dt>

              <dd>
                {
                  selected.collectionId
                }
              </dd>
            </div>

            <div>
              <dt>
                Creator
              </dt>

              <dd>
                {selected.creator}
              </dd>
            </div>

            <div>
              <dt>
                Source
              </dt>

              <dd>
                {
                  selected.source.type
                }
              </dd>
            </div>

            <div>
              <dt>
                Source ref
              </dt>

              <dd>
                {
                  selected.source
                    .reference
                }
              </dd>
            </div>
          </dl>
        </section>

        <section className="ti-origin-modes__config">
          <header>
            <span>
              Configuration
            </span>

            <small>
              authoritative:false
            </small>
          </header>

          <pre>
            {JSON.stringify(
              selected.modeConfig,
              null,
              2
            )}
          </pre>
        </section>
      </div>

      <section className="ti-origin-modes__capture">
        <header>
          <span>
            Capture result
          </span>

          <strong>
            {capture.accepted
              ? "ACCEPTED"
              : "REJECTED"}
          </strong>
        </header>

        <div className="ti-origin-modes__capture-grid">
          <div>
            <span>
              Mode
            </span>

            <strong>
              {
                capture.record
                  ?.context.mode ??
                activeMode
              }
            </strong>
          </div>

          <div>
            <span>
              Status
            </span>

            <strong>
              {
                capture.record
                  ?.status ??
                "NONE"
              }
            </strong>
          </div>

          <div>
            <span>
              Version
            </span>

            <strong>
              {
                capture.record
                  ?.version ??
                "-"
              }
            </strong>
          </div>

          <div>
            <span>
              Authority
            </span>

            <strong>
              NONE
            </strong>
          </div>
        </div>
      </section>

      <footer className="ti-origin-modes__footer">
        <span>
          mode ≠ provenance
        </span>

        <span>
          mode ≠ ownership
        </span>

        <span>
          capture ≠ authenticity
        </span>

        <span>
          RPC:none
        </span>
      </footer>
    </section>
  );
}

export default NftOriginModesWorkspace;
