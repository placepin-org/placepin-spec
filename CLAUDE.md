# placepin-spec — working notes

The normative specification for the placepin location protocol, and the
conformance fixtures every implementation is measured against.

| File                       | What it is                                                      |
| -------------------------- | --------------------------------------------------------------- |
| `SPEC.md`                  | The specification. **Normative.**                               |
| `vectors.json`             | Appendix A, language-neutral. Published as `@placepin/vectors`. |
| `reference/live-demo.html` | The original single-file reference implementation (§09)         |

```sh
npm test    # 6 fixture-integrity tests, no dependencies
```

## Editing a vector is editing the protocol

This is the thing to be careful about in this repo.

§03: _conformance is defined by the test vectors in Appendix A, not by the
prose_, because `sin`/`cos`/`sqrt` are not bit-identical across platforms. The
vectors are not a test of the protocol — for practical purposes they **are** the
protocol.

So a change to `vectors.json`:

- changes what codes mean, everywhere, in every language
- requires a **minor** version bump while on `0.x` (never a patch)
- requires a `PROTOCOL.md` entry
- should need a reviewer who knows all of the above — this file belongs under
  CODEOWNERS

If an implementation disagrees with a vector, the implementation is wrong. That
is the entire point of publishing them.

## vectors.json is generated, not hand-written

It is produced from a validated build of `placepin-js`, so the fixtures cannot
drift from an implementation that passes them. The generator also **proves** the
four supplementary MUSTs before writing them into the file:

- the antimeridian identity — `encode(0, 180) == encode(0, −180)`
- suffix containment — a 3- or 6-character suffix strictly contains the leaf
- prefix non-relation — a leading block is _not_ related to the full code
- the partition invariant — `sum(cols) == factor`, every box, every level

Do not hand-edit it. Regenerate, and let generation fail if an assertion breaks.

## Why the fixtures are their own package

Split out so every implementation — including the reference one — consumes them
as a pinned external artifact. `placepin-js` takes a dev dependency on them
exactly as a Python or Rust implementation would.

Bumping the protocol publishes new vectors and turns every implementation's CI
red until someone deals with it. That signal is the reason this is a separate
repo rather than a folder.

## The rule implementers get wrong

Truncation runs **right to left**.

```
PYY-ZT7-WMR   leaf, ≈5 m
    ZT7-WMR   the ≈840 m cell it sits inside      ← valid on its own
        WMR   the ≈137 km region containing both  ← valid on its own
PYY           NOT AN ADDRESS
```

§01, normative: _Software MUST NOT decode a 3-character input as Block 1 (local)
in isolation._ Resolving a bare local block against approximate position is a
legitimate product feature — it is not `decode()`, and it must live in a
separate module.

§08: string similarity implies nothing except a genuine right-anchored suffix
match.

## Stability

v5 is a **draft**. §10: nothing before v5-final is durable. §02 leaves the
letter `Y` unresolved pending speech and handwriting transcription trials — if
`Y` is dropped the alphabet becomes 29 characters and every code that exists
changes meaning, with no checksum to catch it (§06).

`1.0.0` is reserved for the freeze.

## Licences

Two apply here, per §10:

- **Specification text** (`SPEC.md`, `README.md`) — CC BY 4.0
- **Code and fixtures** (`vectors.json`, `index.js`, `reference/`) — Apache-2.0

**Outstanding:** `LICENSE` currently carries the short-form notices. Drop in the
full canonical texts from creativecommons.org and apache.org — a protocol asking
others to implement it should ship complete licences.

## Conventions

Brand is lowercase
**placepin**, never "PlacePin".
