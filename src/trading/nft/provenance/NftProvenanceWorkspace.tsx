import {
  useMemo,
} from "react";

import {
  CheckCircle2,
  Fingerprint,
  GitBranch,
  Link2,
  Network,
  ShieldCheck,
} from "lucide-react";

import {
  nftProvenanceClosureFixture,
} from "./closureFixtures";

import {
  validateNftProvenanceClosure,
} from "./closure";

import {
  validateProvenanceConsistency,
} from "./consistency";

export function NftProvenanceWorkspace() {
  const fixture =
    nftProvenanceClosureFixture;

  const closure =
    useMemo(
      () =>
        validateNftProvenanceClosure(
          fixture.provenance,
          fixture.history,
          fixture.origin,
          fixture.dna,
          fixture.lineage
        ),
      [fixture]
    );

  const consistency =
    useMemo(
      () =>
        validateProvenanceConsistency(
          fixture.provenance,
          fixture.history,
          fixture.origin,
          fixture.dna
        ),
      [fixture]
    );

  const latestHistory =
    fixture.history.entries[
      fixture.history.entries.length - 1
    ];

  return (
    <section
      className="ti-provenance"
      data-provenance-workspace
      data-authority="none"
    >
      <header className="ti-provenance__hero">
        <div>
          <span className="ti-label">
            Provenance
          </span>

          <h3>
            Evidence Graph & Provenance Chain
          </h3>

          <p>
            Inspect how Origin, DNA, integrity and
            blockchain evidence are linked into a
            deterministic provenance graph without
            treating that graph as ownership or
            absolute authenticity.
          </p>
        </div>

        <Network
          size={24}
          strokeWidth={1.4}
        />
      </header>

      <section className="ti-provenance__metrics">
        <article>
          <span>
            Evidence
          </span>

          <strong>
            {
              fixture.provenance
                .evidence.length
            }
          </strong>

          <small>
            referenced nodes
          </small>
        </article>

        <article>
          <span>
            Links
          </span>

          <strong>
            {
              fixture.provenance
                .links.length
            }
          </strong>

          <small>
            graph relationships
          </small>
        </article>

        <article>
          <span>
            History
          </span>

          <strong>
            {
              fixture.history
                .entries.length
            }
          </strong>

          <small>
            append-only entries
          </small>
        </article>

        <article>
          <span>
            Closure
          </span>

          <strong>
            {closure.valid
              ? "PASS"
              : "FAIL"}
          </strong>

          <small>
            authority:none
          </small>
        </article>
      </section>

      <div className="ti-provenance__grid">
        <section className="ti-provenance__panel">
          <header>
            <span>
              <Fingerprint
                size={15}
              />
              Evidence Nodes
            </span>

            <small>
              authoritative:false
            </small>
          </header>

          <div className="ti-provenance__evidence">
            {fixture.provenance.evidence.map(
              (evidence) => (
                <article
                  key={evidence.id}
                >
                  <div>
                    <strong>
                      {evidence.kind}
                    </strong>

                    <span>
                      {evidence.id}
                    </span>
                  </div>

                  <code>
                    {
                      evidence.reference
                    }
                  </code>

                  <small>
                    {
                      evidence.observedAt
                    }
                  </small>
                </article>
              )
            )}
          </div>
        </section>

        <section className="ti-provenance__panel">
          <header>
            <span>
              <Link2
                size={15}
              />
              Evidence Links
            </span>

            <small>
              graph edges
            </small>
          </header>

          <div className="ti-provenance__links">
            {fixture.provenance.links.map(
              (link) => (
                <article
                  key={link.id}
                >
                  <strong>
                    {link.type}
                  </strong>

                  <code>
                    {
                      link.fromEvidenceId
                    }
                    {" → "}
                    {
                      link.toEvidenceId
                    }
                  </code>
                </article>
              )
            )}
          </div>
        </section>
      </div>

      <section className="ti-provenance__closure">
        <header>
          <div>
            <span className="ti-label">
              Cross-domain closure
            </span>

            <strong>
              {closure.valid
                ? "CONSISTENT"
                : "INCONSISTENT"}
            </strong>
          </div>

          <ShieldCheck
            size={18}
            strokeWidth={1.5}
          />
        </header>

        <div className="ti-provenance__closure-grid">
          <div>
            <span>
              Provenance
            </span>

            <strong>
              {closure.provenanceValid
                ? "PASS"
                : "FAIL"}
            </strong>
          </div>

          <div>
            <span>
              History
            </span>

            <strong>
              {closure.historyValid
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
              DNA
            </span>

            <strong>
              {closure.dnaValid
                ? "PASS"
                : "FAIL"}
            </strong>
          </div>

          <div>
            <span>
              Consistency
            </span>

            <strong>
              {closure.consistencyValid
                ? "PASS"
                : "FAIL"}
            </strong>
          </div>
        </div>

        {closure.valid &&
        consistency.consistent ? (
          <div className="ti-provenance__pass">
            <CheckCircle2
              size={16}
            />

            <span>
              Current provenance, history,
              Origin and DNA describe a
              consistent modeled state.
            </span>
          </div>
        ) : null}
      </section>

      <section className="ti-provenance__history">
        <header>
          <span>
            <GitBranch
              size={15}
            />
            Provenance History
          </span>

          <small>
            latest v
            {latestHistory.version}
          </small>
        </header>

        <div>
          {fixture.history.entries.map(
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

      <div className="ti-provenance__boundary">
        <ShieldCheck
          size={15}
        />

        <span>
          Internal provenance consistency is
          evidence about the modeled chain.
          It does not establish legal ownership,
          absolute authenticity or governance
          authority.
        </span>
      </div>

      <footer className="ti-provenance__footer">
        <span>
          provenance ≠ ownership
        </span>

        <span>
          evidence ≠ absolute truth
        </span>

        <span>
          blockchain proof ≠ legal title
        </span>

        <span>
          authority:none
        </span>

        <span>
          RPC:none
        </span>
      </footer>
    </section>
  );
}

export default NftProvenanceWorkspace;
