# placepin-spec

The normative specification for the [placepin](https://placepin.org) location
protocol, and the conformance fixtures every implementation is measured against.

```
PYY-ZT7-WMR
│   │   └── region  ≈137 km   ← the only block meaningful on its own
│   └────── area    ≈840 m
└────────── local   ≈5 m      ← the part a person is actually told
```

| File | What it is |
|---|---|
| [`SPEC.md`](./SPEC.md) | The specification. Normative. |
| [`vectors.json`](./vectors.json) | Appendix A, language-neutral. **This is what conformance means.** |
| [`reference/live-demo.html`](./reference/live-demo.html) | The original single-file reference implementation (§09) |

## Why the vectors are their own artifact

Spec §03 is unusually direct about this:

> Transcendental functions (`sin`, `cos`, `sqrt`) are not bit-identical across
> platforms; therefore **conformance is defined by the test vectors in Appendix
> A, not by the prose**. […] Implementations MUST ship the vector suite in their
> tests.

So the fixtures are published rather than transcribed. Every implementation —
JavaScript, Python, Rust, anything — consumes the same `vectors.json` from the
same tagged release. Nobody retypes Appendix A and quietly drifts, and no
implementation gets to mark its own exam paper.

That includes the reference one. `placepin-js` takes a dev dependency on these
fixtures exactly as a third-party implementation would.

## Using the fixtures

```js
import { VECTORS } from '@placepin/vectors';
```

Or read `vectors.json` directly — it has no JavaScript in it and is meant to be
loaded from any language.

Each entry is an input coordinate, the code it must produce, and the centre that
code must decode back to at six decimal places:

```json
{
  "input":  { "lat": 51.5074, "lng": -0.1278 },
  "code":   "PYY-ZT7-WMR",
  "centre": { "lat": 51.507387, "lng": -0.127806 }
}
```

`supplementary` carries the four MUSTs that aren't a single row: the
antimeridian identity, suffix containment, prefix non-relation, and the
partition invariant. `constants` carries the alphabet, base, factor and Earth
radius so an implementation can assert it agrees before it starts.

## The one thing implementers get wrong

Truncation runs **right to left**.

```
PYY-ZT7-WMR   leaf, ≈5 m
    ZT7-WMR   the ≈840 m cell it sits inside      ← valid on its own
        WMR   the ≈137 km region containing both  ← valid on its own
PYY           NOT AN ADDRESS
```

`PYY` alone names one of 27,000 local cells *relative to whichever area cell it
is paired with* — the same three characters mean a different real place inside
every one of ~729 million area-and-region combinations. §01 makes it normative:

> Software MUST NOT decode a 3-character input as Block 1 (local) in isolation —
> a lone 3-character code is always Block 3 (region).

Resolving a bare local block against someone's approximate position is a
legitimate and useful product feature. It is **not** `decode()`, and it does not
change what `decode()` returns. Keep it in a separate module.

And per §08: string similarity implies nothing except a genuine right-anchored
suffix match. Two codes sharing a local block are usually continents apart, so
no prefix index over placepin codes means anything.

## Stability

**v5 is a draft. Nothing emitted before v5-final is a durable code** (§10), and
§02 leaves the letter `Y` unresolved pending speech and handwriting
transcription trials. If `Y` is dropped the alphabet becomes 29 characters and
**every code that exists changes meaning** — with no checksum to catch it (§06).

Versioning follows from that:

- Everything stays `0.x` until the protocol freezes. `1.0.0` is the freeze.
- While on `0.x`, a change that moves any vector is a **minor** bump. Never a
  patch.
- npm pins carets to the minor below 1.0, so `^0.1.0` will not resolve `0.2.0`.
  A protocol change cannot enter an implementation through a routine update —
  someone has to take it deliberately.
- Changing a row in `vectors.json` **is** changing the protocol. It should need
  a reviewer who knows that.

## Implementations

| Language | Repo | Package |
|---|---|---|
| JavaScript / TypeScript | [placepin-js](https://github.com/placepin-org/placepin-js) | `@placepin/core-js` |

Others are welcome. Reproduce every vector, hold the §03 invariants, and mirror
the normative / non-normative split in whatever idiom your language prefers.

## Licence

Specification text: **CC BY 4.0**.
Reference code and fixtures: **Apache-2.0**.

Per §10, the protocol's identity must survive the domain name. Fork it, mirror
it, implement it — just don't silently change what a code means.
