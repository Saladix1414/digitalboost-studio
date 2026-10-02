import {
  useMemo,
  useState,
} from "react";

import {
  Archive,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  nftOriginCapturedFixture,
  nftOriginValidatedFixture,
} from "./fixtures";

import {
  nftOriginHistoryFixture,
} from "./historyFixtures";

import {
  nftOriginDnaBridgeDnaFixture,
  nftOriginDnaBridgeLineageFixture,
  nftOriginDnaBridgeOriginFixture,
} from "./dnaBridgeFixtures";

import {
  validateOriginAgainstDna,
} from "./dnaBridge";

import {
  validateOriginDnaClosure,
} from "./dnaBridgeClosure";

import type {
  NftOriginRecord,
} from "./types";

type OriginView =
  | "CAPTURED"
  | "VALIDATED"
  | "BRIDGED";

export function NftOriginWorkspace() {
  const [
    view,
    setView,
  ] =
    useState<OriginView>(
      "BRIDGED"
    );

  const origin:
    NftOriginRecord =
      view === "CAPTURED"
        ? nftOriginCapturedFixture
        : view === "VALIDATED"
          ? nftOriginValidatedFixture
          : nftOriginDnaBridgeOriginFixture;

  const bridge =
    useMemo(
      () =>
        validateOriginAgainstDna(
          nftOriginDnaBridgeOriginFixture,
          nftOriginDnaBridgeDnaFixture
        ),
      []
    );

  const closure =
    useMemo(
      () =>
        validateOriginDnaClosure(
          nftOriginDnaBridgeOriginFixture,
          nftOriginDnaBridgeDnaFixture,
          nftOriginDnaBridgeLineageFixture
        ),
      []
    );

  return (
    <section
      className="ti-origin"
      data-origin-authority="none"
    >
      <header className="ti-origin__hero">
        <div>
          <span className="ti-label">
            Origin
          </span>

          <h3>
            Creation Context & Capture History
          </h3>

          <p>
            Inspect how an NFT asset was created,
            captured, revised and aligned with its
            DNA without converting Origin into
            provenance or ownership authority.
          </p>
        </div>

        <Sparkles
          size={24}
          strokeWidth={1.4}
        />
      </header>

      <div className="ti-origin__controls">
        <button
          type="button"
          className={
            view === "CAPTURED"
              ? "is-active"
              : ""
          }
          onClick={() =>
            setView(
              "CAPTURED"
            )
          }
        >
          Captured
        </button>

        <button
          type="button"
          className={
            view === "VALIDATED"
              ? "is-active"
              : ""
          }
          onClick={() =>
            setView(
              "VALIDATED"
            )
          }
        >
          Validated
        </button>

        <button
          type="button"
          className={
            view === "BRIDGED"
              ? "is-active"
              : ""
          }
          onClick={() =>
            setView(
              "BRIDGED"
            )
          }
        >
          DNA aligned
        </button>
      </div>

      <div className="ti-origin__summary">
        <div>
          <span>
            Status
          </span>

          <strong>
            {origin.status}
          </strong>
        </div>

        <div>
          <span>
            Mode
          </span>

          <strong>
            {
              origin.context
                .mode
            }
          </strong>
        </div>

        <div>
          <span>
            Version
          </span>

          <strong>
            {origin.version}
          </strong>
        </div>

        <div>
          <span>
            History entries
          </span>

          <strong>
            {
              nftOriginHistoryFixture
                .entries
                .length
            }
          </strong>
        </div>
      </div>

      <div className="ti-origin__grid">
        <section className="ti-origin__panel">
          <header>
            <span>
              <ShieldCheck
                size={15}
              />
              Origin Identity
            </span>

            <small>
              authority:none
            </small>
          </header>

          <dl>
            <div>
              <dt>
                Asset
              </dt>

              <dd>
                {
                  origin.identity
                    .assetId
                }
              </dd>
            </div>

            <div>
              <dt>
                Collection
              </dt>

              <dd>
                {
                  origin.identity
                    .collectionId
                }
              </dd>
            </div>

            <div>
              <dt>
                Creator
              </dt>

              <dd>
                {
                  origin.identity
                    .creator
                }
              </dd>
            </div>
          </dl>
        </section>

        <section className="ti-origin__panel">
          <header>
            <span>
              <Sparkles
                size={15}
              />
              Creation Context
            </span>

            <small>
              captured context
            </small>
          </header>

          <dl>
            <div>
              <dt>
                Created
              </dt>

              <dd>
                {
                  origin.context
                    .createdAt
                }
              </dd>
            </div>

            <div>
              <dt>
                Forge config
              </dt>

              <dd>
                {
                  origin.context
                    .forgeConfig
                }
              </dd>
            </div>

            <div>
              <dt>
                Source
              </dt>

              <dd>
                {
                  origin.context
                    .source
                    .reference
                }
              </dd>
            </div>

            <div>
              <dt>
                Source type
              </dt>

              <dd>
                {
                  origin.context
                    .source
                    .type
                }
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="ti-origin__bridge">
        <header>
          <span className="ti-label">
            Origin ↔ DNA consistency
          </span>

          <strong>
            {bridge.consistent
              ? "CONSISTENT"
              : "INCONSISTENT"}
          </strong>
        </header>

        <div className="ti-origin__bridge-metrics">
          <div>
            <span>
              Bridge
            </span>

            <strong>
              {bridge.consistent
                ? "PASS"
                : "FAIL"}
            </strong>
          </div>

          <div>
            <span>
              DNA closure
            </span>

            <strong>
              {closure.dnaValid
                ? "PASS"
                : "FAIL"}
            </strong>
          </div>

          <div>
            <span>
              Origin
            </span>

            <strong>
              {closure.originValid
                ? "PASS"
                : "FAIL"}
            </strong>
          </div>

          <div>
            <span>
              Cross-domain
            </span>

            <strong>
              {closure.bridgeValid
                ? "PASS"
                : "FAIL"}
            </strong>
          </div>
        </div>

        {closure.valid ? (
          <div className="ti-origin__closure-pass">
            <CheckCircle2
              size={16}
            />

            <span>
              Origin and DNA describe a
              consistent domain state.
            </span>
          </div>
        ) : null}
      </section>

      <section className="ti-origin__history">
        <header>
          <span>
            <GitBranch
              size={15}
            />
            Capture History
          </span>

          <small>
            append-only domain evidence
          </small>
        </header>

        <div>
          {nftOriginHistoryFixture.entries.map(
            (entry) => (
              <article
                key={entry.id}
              >
                <div>
                  <span>
                    v{entry.version}
                  </span>

                  <strong>
                    {entry.reason}
                  </strong>
                </div>

                <small>
                  {
                    entry.capturedAt
                  }
                </small>

                <code>
                  {
                    entry.snapshot
                      .recordHash
                  }
                </code>
              </article>
            )
          )}
        </div>
      </section>

      <div className="ti-origin__boundary">
        <Archive
          size={15}
        />

        <span>
          Origin history records creation
          context. It does not establish
          provenance, ownership or legal
          authenticity.
        </span>
      </div>

      <footer className="ti-origin__footer">
        <span>
          origin ≠ provenance
        </span>

        <span>
          origin ≠ ownership
        </span>

        <span>
          consistency ≠ authority
        </span>

        <span>
          RPC:none
        </span>
      </footer>
    </section>
  );
}

export default NftOriginWorkspace;
