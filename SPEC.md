# placepin.org — location code specification

*Open location protocol · specification draft*

A language-neutral, human-readable location code for giving any point on Earth a short address: compact enough to say and type, deterministic enough to decode offline, and open enough for anyone to implement.

**Format:** 3–3–3 alphanumeric
**Example:** `PYY-ZT7-WMR`
**Precision:** ≈5.1 m leaf cell (varies ≈4.5–5.1 m at inhabited latitudes; see §03), inside a 3-level hierarchy
**Revision:** draft · v5 — block order flipped to local → area → region (finest to coarsest, left to right); grid, alphabet, encoding and normalization otherwise unchanged from v4

---

## Changes from v4 (why v5 exists)

v5 makes one structural change: the three blocks are now **written finest-to-coarsest** instead of coarsest-to-finest. A code still names the same three nested cells, computed exactly the same way — only the order they're written in flips. `PYY-ZT7-WMR` under v5 encodes the identical point that `WMR-ZT7-PYY` encoded under v4; every Appendix A vector below is the same underlying blocks as v4's, just reordered. The alphabet, grid algorithm, apportionment rule, and normalization are all untouched.

**Why:** the coarsest block — the ≈137 km region — is the part almost nobody actually knows or remembers; nobody has "which of 27,000 global regions am I in" memorized. The finest block — the ≈5 m local spot — is far more plausibly something a person actually knows or was told directly. This also matches how most real postal addresses already read: most-specific-first (house number, street), most-general-last (city, region, country). Writing the code the same way opens the door to a proximity-aware input experience — a search box can accept just the local block a person actually knows, and use a rough sense of where they are (device location, a stated city) to suggest the matching area and region, instead of requiring the least memorable part to be typed first.

**The honest cost:** v4's headline truncation property flips too. Under v4, a *prefix* of a code was a valid, independently decodable coarser address — say as much as you know, left to right, and stop. Under v5, that property moves to the *suffix*: `WMR` alone and `ZT7-WMR` are still fully valid, independently decodable addresses on their own, but `PYY` alone is not — the local block is only ever meaningful together with the coarser blocks anchoring it, on whichever end of the string it happens to sit. A bare local value is a **search input**, resolved with the help of approximate location context; it is not a self-contained code. §01 states this precisely, and it is the single most important behavioral difference from every prior revision.

> **A caution about optional suffixes (carried forward from v4, still relevant)**
> Reinterpreting an optional suffix without changing the visible form repeats the mistake v1→v2 made once before. This document is not doing that here — the *block order* changed, which is a visibly different form (every v5 code reads differently from a v4 code sharing the same characters), not a silent reinterpretation of what an existing v4 code means. Any future revision that adds a genuinely optional suffix MUST still make its presence unambiguous some other way (a version marker, a different length, or a distinct grouping), not just a bare extra character.

---

## 00 · Summary

### A human address without a language-specific vocabulary

placepin.org maps a geographic point to a short, fixed-format alphanumeric address and back again. The canonical form is **nine characters grouped 3–3–3, written finest-to-coarsest**.

```
PYY-ZT7-WMR
```

The code is built from **three nested dive-downs**, not one flat index cut into pieces — but read left to right, it goes from the most specific cell *outward*, not the reverse. Block 3 (rightmost) names a real ≈137 km region of the Earth; block 2 is a fresh subdivision of *that specific region* down to ≈840 m; block 1 (leftmost) subdivides again down to a leaf cell of roughly **5.1 m** on a side (≈4.5–5.1 m at inhabited latitudes — see §03). A code can be shortened by dropping characters from the **left**: `WMR` alone or `ZT7-WMR` are both still fully valid, independently decodable addresses for a coarser cell. `PYY` alone is not — the local block only means something together with the region it's paired with. When decoding a code, the returned coordinate is the **centre of its cell**.

> **Core principle**
> The code does not need to be a word or carry semantic meaning — the alphabet contains no vowels, so it can't be one. Human usability comes from a deliberately constrained alphabet, fixed grouping, case-insensitive handling and strong character distinguishability.

---

## 01 · Anatomy of a code

### Block order is meaningful — and now runs finest-to-coarsest

The address is a hyphen-separated, case-insensitive string of nine characters, read as three ordered blocks, written **local → area → region** (finest to coarsest, left to right) — the reverse of computation order, since a block still only means something relative to the specific cell its *coarser* neighbour selected. **Block order is not arbitrary**: `PYY-ZT7-WMR` and `WMR-ZT7-PYY` are not the same claim — the second reads as region `WMR`, subdivided by area `ZT7`, subdivided further by local `PYY`, an entirely different cell chain from the first.

| Component | Form | Role |
|---|---|---|
| Block 1 (local) | `XXX` | Names one of 30³ = 27,000 leaf cells *inside block 2's specific area* (≈5.1 m each) |
| Block 2 (area) | `XXX` | Names one of 27,000 sub-areas *inside block 3's specific region* (≈840 m each) |
| Block 3 (region) | `XXX` | Names one of 30³ = 27,000 top-level regions covering the whole Earth (≈137 km each) |

A truncated code is still a fully valid, independently decodable address for a coarser cell — but truncation now happens from the **left**, not the right:

```
PYY-ZT7-WMR   // leaf cell, ≈5.1 m — full precision
    ZT7-WMR   // the ≈840 m cell that leaf sits inside
        WMR   // the ≈137 km region both of the above sit inside
```

Dropping the *rightmost* block(s) instead — `PYY-ZT7` or `PYY` alone — does **not** yield a valid shorter address. `PYY` is one of 27,000 possible local values *relative to whichever area cell it's paired with*; the same three characters name a different real-world spot inside every one of the ~729 million possible area+region combinations. A bare local block is a **search input**, not a code.

> **Human-facing rule**
> Display uppercase. Accept lowercase on input. Hyphens are grouping characters, not data. The canonical form is rendered as `XXX-XXX-XXX`, or `XXX` / `XXX-XXX` for a coarser truncated address **taken from the right-hand end of the code**. A conforming decoder accepts exactly 3, 6 or 9 characters (after stripping hyphens and spaces); a 3- or 6-character input is always interpreted as the coarse end (region, or area+region), never the fine end.

> **A bare local block is not an address (normative)**
> Software MUST NOT decode a 3-character input as Block 1 (local) in isolation — a lone 3-character code is always Block 3 (region), because region is the only block with a fixed, context-free meaning. A product feature that lets someone type just a local value and resolves it against their approximate location (device GPS, a stated city, a search radius) is a **separate, non-normative search/autocomplete feature** built on top of `decode()` — it is not a change to what a bare 3-character string decodes to.

---

## 02 · Alphabet

### A small, human-safe, word-proof character set

The protocol uses a restricted 30-character alphabet:

```
0 1 2 3 4 5 6 7 8 9 B C D F G H J K M N P Q R S T V W X Y Z
```

| Property | Rationale |
|---|---|
| **All vowels excluded** (A, E, I, O, U) | Blocks cannot spell words — no `ASS`, no `FUK`, no code landing on a school becoming a screenshot. This is the same reasoning that led Open Location Code to a vowel-free set. |
| **L excluded** | 1/l/I confusion class |
| **0 and 1 included** | Safe *because* O, I and L are excluded — the characters they are usually confused with are simply absent. Restoring them keeps the alphabet at 30 and the leaf cell near 5 m; a 28-character vowel-free set would have grown the leaf to ≈6.9 m. |
| Case-insensitive | Speech and typing must not depend on capitalisation |

With 30 possible characters in each of nine positions, the canonical format has **30⁹ = 19,683,000,000,000 (≈19.68 trillion)** possible addresses. Spread over Earth's surface area of ≈510.07 trillion m² (sphere, R = 6,371 km), that is about **25.91 m² per address** on average — a nominal square of roughly **5.09 m × 5.09 m**. §03 splits those nine characters into three blocks of 30³ = 27,000 and uses each block to dive one level deeper into the area the coarser block named.

> **Known residual risks — to validate before freeze**
> The letter **Y** can act as a semi-vowel: blocks like `SKY`, `GYM`, `TRY` are possible, and at least one three-letter Y-word (`GYP`) is considered a slur. If validation testing decides this is unacceptable, the fallback is a 29-character alphabet without Y (leaf grows to ≈5.9 m) — decide before freeze, not after. Separately, the pairs 1/7 (European handwriting), 2/Z, 5/S, 8/B (visual) and M/N (phone audio) remain in the set and are the priority for planned speech/handwriting transcription trials. The alphabet is **not yet frozen** until those trials complete (§10).

---

## 03 · The grid

### A recursive, three-level equal-area lattice

The Earth is divided by a deterministic grid, and a geographic point maps to a cell whose index is encoded into the nine-character address. The same partitioning routine is applied three times, each time scoped to the specific cell the coarser block selected, so the code is a genuine dive-down — computed coarsest-to-finest even though it's written finest-to-coarsest (§01).

### The partition routine (normative)

Given any lat/lng box and a budget of `FACTOR` = 30³ = 27,000 sub-cells (exactly what three alphabet characters can address), `partition()` splits the box into equal-height rows, gives each row its own column count sized to that row's actual east–west extent, and then distributes the leftover budget by **largest-remainder apportionment, cycling as many passes as needed** until the budget is exactly consumed.

The cycling matters. A single top-up pass can hand out at most one extra column per row, but the leftover budget routinely *exceeds* the number of rows — two shortfalls stack: each row loses up to one column to `floor()`, and the row count itself is floored, which shrinks the raw column total by roughly `FACTOR / rows` (≈150–190 columns at typical row counts). Measured on the whole Earth: 145 rows but a leftover of **203 columns**, which a single pass cannot place. This specification therefore requires:

1. Compute each row's raw (fractional) column count and floor it (minimum 1).
2. Sort rows by **descending fractional remainder, ties broken by ascending row index**. This ordering is fixed once, before any top-ups.
3. Walk that order cyclically — row by row, wrapping around — adding one column per visit, until `sum(cols) == FACTOR` exactly.

The invariant `total == FACTOR` MUST hold after every partition, at every level, for every box. An implementation that cannot assert this is non-conforming.

### Cell bounds (normative)

Rows and columns are **half-open intervals**: a cell owns its lower latitude and longitude bounds and excludes its upper bounds, except that the last row of a box owns the box's exact upper latitude and the last column of a row owns the box's exact upper longitude. When reconstructing a cell's bounds, the last row/column MUST snap exactly to the parent box's upper bound rather than being computed by accumulation — floating-point accumulation can overshoot the parent by one ulp, which breaks the nesting guarantee. (This is not hypothetical: the pre-snapping reference implementation failed strict-containment checks; with snapping, 1,000/1,000 sampled codes nest exactly.)

### Three dives, one routine

Encoding calls `partition()` three times, coarsest first. The first call is scoped to the whole Earth (−90°..90°, −180°..180°) and produces **Block 3 (region)**; its winning cell's bounds become the box for the second call, which produces **Block 2 (area)**; that cell's bounds become the box for the third call, which produces **Block 1 (local)**. The three characters are then written in the *opposite* order to how they were computed — local, area, region — for the reasons given in the "Changes" section above.

| Block (write position) | Box it divides | Rows (measured) | Measured cell size |
|---|---|---|---|
| Block 3 (region) — computed first | Whole Earth | 145 | 138.0 km row height (constant); width 108.4–137.3 km (4–292 columns per row) |
| Block 2 (area) — computed second | Block 3's specific cell | 164–166 | ≈820–842 m per side, near-square (sampled −85°..85°) |
| Block 1 (local, leaf) — computed third | Block 2's specific cell | 164–165 | ≈4.5–5.1 m per side at sampled latitudes (−89.9°..89.9°) |

Worked example for `PYY-ZT7-WMR` (central London): the region block alone (`WMR`) names a 138.0 km × 137.2 km area; adding the area block (`ZT7-WMR`) narrows that to 841.7 m × 835.9 m *inside* it; adding the local block (`PYY-ZT7-WMR`) narrows to a 5.1 m × 5.1 m leaf cell inside *that*. Each stage is programmatically verified to nest inside the one before it — reading right to left.

> **Decode behaviour**
> Decoding a code returns the **centre of its cell** and exposes all levels' bounds up to that point, not just the leaf's — so a UI can draw the full dive-down. A 3- or 6-character **suffix** decodes on its own, returning the coarser block's centre and bounds; a bare 3-character *prefix* (the local block alone) does not decode to anything meaningful (§01).

> **Leaf area is not one constant**
> Three independent roundings compound, so leaf-cell area ranges **≈20.1–26.2 m²** (≈4.5–5.1 m per side) across 5,000 sampled points spanning −89.9°..89.9° latitude; the median is ≈25.9 m². **At the poles themselves the leaf degrades further**: the polar leaf cell measures ≈4.0 m × 2.9 m, outside the sampled range and with a ≈1.4:1 aspect ratio. This variance is the direct cost of making the code hierarchical.

> **Determinism (normative)**
> All arithmetic is IEEE-754 binary64. The formulas in §04 define the exact sequence of operations; implementations MUST NOT reorder, refactor or "simplify" them, because `floor()` boundaries turn one-ulp differences into different grids. Transcendental functions (`sin`, `cos`, `sqrt`) are not bit-identical across platforms; therefore **conformance is defined by the test vectors in Appendix A, not by the prose**: an implementation that reproduces every vector exactly, and holds the §03 invariants, is conforming. Implementations MUST ship the vector suite in their tests.

> **Still not a general solution**
> Cells near the poles are more distorted than cells near the equator, for the meridian-convergence reason inherent to any lat/lng-aligned grid. Discrete global grid systems with uniform distortion (S2, H3, HEALPix) require abandoning lat/lng alignment — a different topology, out of scope here.

---

## 04 · Encoding

### Normalize, compute coarsest-first, write finest-first

The reference algorithm below is complete and validated: 5,000 random round trips (encode → decode) with the decoded box containing the original point every time; 3- and 6-character **suffix** boxes strictly contain their leaf cells in 1,000/1,000 checks; poles and the antimeridian encode correctly; and `encode(0, 180)` and `encode(0, −180)` produce the **same** code (they are the same meridian).

```
// ---- constants ----
const ALPHABET = "0123456789BCDFGHJKMNPQRSTVWXYZ"   // 30 chars — no vowels, no L
const BASE     = 30
const R        = 6371000                             // mean Earth radius, m
const FACTOR   = BASE³                                // 27,000 — one block's address space

// ---- input normalization (normative) ----
// Coordinates are WGS84 latitude/longitude in degrees. The spherical grid
// arithmetic is an addressing convention, not a geodetic claim.
function normalize(lat, lng):
    lat = clamp(lat, -90, 90)
    lng = ((lng + 180) mod 360) - 180        // result in [-180, 180); +180 maps to -180
    return lat, lng

// ---- spherical area of a lat/lng box ----
function bandArea(latMin, latMax, lngMin, lngMax):
    return (lngMax-lngMin)·π/180 · R² · (sin(latMax·π/180) - sin(latMin·π/180))

// ---- partition a box into exactly FACTOR cells (normative; see §03) ----
function partition(latMin, latMax, lngMin, lngMax):
    area = bandArea(latMin, latMax, lngMin, lngMax)
    s    = sqrt(area / FACTOR)
    rows = max(1, floor((latMax-latMin)·π/180·R / s))
    loop:
        total = 0
        for row in 0 .. rows-1:
            latC      = latMin + (row+0.5)·(latMax-latMin)/rows
            raw[row]  = (lngMax-lngMin)·π/180·R·cos(latC·π/180) / s
            cols[row] = max(1, floor(raw[row]))
            total    += cols[row]
        if total <= FACTOR or rows == 1: break
        rows -= 1
    // largest-remainder top-up, CYCLING until the budget is exactly consumed.
    // Order: fractional remainder descending; ties broken by row index ascending.
    // The order is computed once and never re-sorted during the top-up.
    order = sort rows by (-(raw[row]-cols[row]), row)
    i = 0
    while total < FACTOR:
        cols[order[i mod rows]] += 1
        total += 1; i += 1
    prefix[0] = 0
    for row in 1 .. rows: prefix[row] = prefix[row-1] + cols[row-1]
    assert prefix[rows] == FACTOR                    // MUST hold, every box, every level
    return {rows, cols, prefix, latMin, latMax, lngMin, lngMax}

function rowColFromLatLng(part, lat, lng):
    rowH = (part.latMax - part.latMin) / part.rows
    row  = clamp(floor((lat - part.latMin) / rowH), 0, part.rows-1)
    span = (part.lngMax - part.lngMin) / part.cols[row]
    col  = clamp(floor((lng - part.lngMin) / span), 0, part.cols[row]-1)
    return {row, col}

// Cell bounds. NORMATIVE: last row/column snaps to the parent's exact upper
// bound — accumulated arithmetic may overshoot the parent by one ulp otherwise.
function boundsFromRowCol(part, row, col):
    rowH   = (part.latMax - part.latMin) / part.rows
    span   = (part.lngMax - part.lngMin) / part.cols[row]
    latMin = part.latMin + row·rowH
    latMax = (row == part.rows-1)      ? part.latMax : part.latMin + (row+1)·rowH
    lngMin = part.lngMin + col·span
    lngMax = (col == part.cols[row]-1) ? part.lngMax : part.lngMin + (col+1)·span
    return {latMin, latMax, lngMin, lngMax}

// ---- ENCODE: coordinates → three-block hierarchical code ----
// Computation runs coarsest-to-finest (region, then area, then local), because
// each step's box is only defined once the coarser step has picked a cell. The
// three characters are then WRITTEN in the opposite order: local, area, region.
function encode(lat, lng):
    lat, lng = normalize(lat, lng)
    bounds = {latMin:-90, latMax:90, lngMin:-180, lngMax:180}
    computed = []                                     // [region, area, local]
    for step in 0 .. 2:
        part = partition(bounds.latMin, bounds.latMax, bounds.lngMin, bounds.lngMax)
        {row, col} = rowColFromLatLng(part, lat, lng)
        computed.push(base30_encode_3_digits(part.prefix[row] + col))
        bounds = boundsFromRowCol(part, row, col)
    blocks = reverse(computed)                        // [local, area, region] — write order
    return join(blocks, '-')

// ---- DECODE: accepts exactly 3, 6 or 9 characters, written finest-first ----
// A short input supplies the LAST N blocks of a full code (the coarse end).
// Decoding still computes coarsest-to-finest regardless of how many blocks
// were given, so the given blocks are reversed before processing.
function decode(code):
    chars = uppercase(remove_hyphens_and_spaces(code))
    assert chars.length in {3, 6, 9}
    assert every char in ALPHABET
    nBlocks = chars.length / 3
    given = [ chars[i·3 .. i·3+2] for i in 0 .. nBlocks-1 ]   // write order
    computeOrder = reverse(given)                              // coarsest-first
    bounds = {latMin:-90, latMax:90, lngMin:-180, lngMax:180}
    for step in 0 .. nBlocks-1:
        idx   = base30_decode_3_digits(computeOrder[step])
        part  = partition(bounds.latMin, bounds.latMax, bounds.lngMin, bounds.lngMax)
        row   = binary_search(part.prefix, idx)       // prefix[row] ≤ idx < prefix[row+1]
        bounds = boundsFromRowCol(part, row, idx - part.prefix[row])
    centre = {lat: mean(bounds.latMin, bounds.latMax), lng: mean(bounds.lngMin, bounds.lngMax)}
    return {centre, bounds}
```

No lookup table is precomputed anywhere — `partition()` is called fresh on whatever box it's handed, working with at most a few hundred rows. The reference implementation completes 10,000 encodes in about 3 seconds of unoptimized interpreted Python (≈0.3 ms per encode); a compiled or JS implementation is substantially faster.

> **Validated, not just implemented**
> The reference build checks: (1) 5,000 random coordinates round-trip through encode → decode with the decoded box containing the original point every time; (2) 3- and 6-character **suffixes** decode to boxes that strictly contain the full code's leaf cell (1,000/1,000 random samples, plus every Appendix A vector); (3) invalid characters and malformed lengths are rejected with specific errors; (4) `partition()`'s `total == FACTOR` invariant holds at every level of every test; (5) the poles, the antimeridian (±180° agree), and null island all encode and round-trip correctly; (6) every Appendix A vector reproduces exactly; (7) a bare local block (the old prefix-truncation shape) is confirmed to decode to an unrelated, essentially arbitrary location — a regression check that the new truncation direction is actually enforced, not just documented.

---

## 05 · Precision

### Canonical resolution, honestly stated

| Form | Meaning | Measured scale |
|---|---|---|
| `WMR` | Block 3 (region) alone — coarse address | ≈108–138 km per side |
| `ZT7-WMR` | Blocks 2+3 (area + region) — mid address | ≈820–842 m per side |
| `PYY-ZT7-WMR` | Canonical address (all three blocks) | ≈4.5–5.1 m per side (≈20.1–26.2 m²); median ≈25.9 m²; polar worst case ≈4.0 × 2.9 m |

When a code is decoded, the system returns the centre of its leaf cell plus the centres and bounds of the two coarser cells it nests inside. This is an address-resolution convention, not a claim that the user's device knows its position to 5 m — GPS error is a separate, usually larger, uncertainty.

### A future deep-dive extension (non-normative)

Nothing in this draft reserves or spends a tenth character (§00). If a future revision wants finer-than-leaf precision, the natural mechanism is a **deep-dive extension**: one or more characters **prepended before Block 1**, each computed by the *same* `partition()` routine used for the three canonical blocks, but scoped to a budget of 30 (one character's worth) instead of 27,000 (a full block), applied to whatever cell the code has reached so far. It goes at the front, not the back, precisely because Block 1 (local) is now the finest end of the code — anything finer than the leaf belongs even further toward that same end.

This has been prototyped and verified, not just sketched: each additional character narrows the previous cell by roughly a further 5–6× per side (≈30× in area), with no fixed limit — keep adding characters for arbitrarily finer precision. Measured sizes, sampled across −89.9°..89.9° latitude:

| Prefix | Meaning | Measured scale |
|---|---|---|
| `X-PYY-ZT7-WMR` | Leaf + 1 deep-dive character | ≈0.7–1.0 m per side |
| `XY-PYY-ZT7-WMR` | Leaf + 2 deep-dive characters | ≈0.14–0.20 m per side |
| `XYZ-PYY-ZT7-WMR` | Leaf + 3 deep-dive characters | ≈0.025–0.034 m per side |

A future revision that ships this MUST make the prefix's presence and meaning unambiguous from the string itself (see the caution note at the top of this document) — for example by requiring it only ever precede a full nine-character canonical code, and by giving it a form a v5-only decoder can recognise and reject rather than silently misdecode.

---

## 06 · Errors & usability

### Optimise for humans

The alphabet is selected for reliable human transcription (§02):

| Requirement | Reason |
|---|---|
| No visually ambiguous characters | 0/O, 1/I/L classes eliminated by exclusion; residual pairs (1/7, 2/Z, 5/S, 8/B, M/N) to be transcription-tested before freeze |
| No word formation | Guaranteed — no vowels in the alphabet (Y caveat: §02) |
| Case insensitive | Speech and typing should not depend on capitalisation |
| Fixed grouping | 3–3–3 is easier to read and dictate than an unbroken nine-character string |
| Simple spoken form | "P Y Y — Z T 7 — W M R" should be unambiguous |

> **No built-in checksum**
> This draft deliberately ships without a check character, a position unchanged since v4. A code with no redundancy has a real failure mode — every corrupted string is still a valid address, somewhere — but this protocol's use case doesn't justify the added complexity of a checksum layer. Applications that need transcription safety should validate through their own UI (read-back confirmation, map preview before use) rather than relying on the code format itself.

> **A new confusion to guard against, specific to v5**
> Because a 3-character string is always interpreted as the coarse (region) end, never the fine (local) end, product copy and UI must never imply that typing "just the first block" gives a coarser address — it gives *nothing decodable* on its own. Any UI that accepts a bare local value for search/autocomplete purposes should visually and behaviorally distinguish that from entering a real, complete-on-its-own code (§01).

---

## 07 · Share card

### The PlacePin becomes the thumbnail

The share/export action can generate a visual card for a PlacePin. The card makes the **code** the hero, keeps `placepin.org` as the brand, and provides a direct URL that can be opened or shared independently of the image.

*(Illustrative share-card image omitted from this Markdown version.)*

- **Code first** — `PYY-ZT7-WMR` is the visual focus, not a map screenshot.
- **Linkable** — `placepin.org/PYY-ZT7-WMR` is readable and independently shareable.
- **Portable** — The image can travel through messaging, email, social posts and exports.

> **Brand rule**
> The logo/wordmark is simply **placepin.org**. No separate pin icon is required. The visual identity comes from the lowercase wordmark, the 3–3–3 code structure and the blue/charcoal system.

> **Implementation note**
> A production share card should render the actual PlacePin, the actual `placepin.org/…` URL, and optionally a QR code or location-specific visual generated from the decoded cell.

---

## 08 · Sharing & handoff

### A convenience over an open code, never a chokepoint

A code may be shared as bare text: `PYY-ZT7-WMR`, or through a web link such as `https://placepin.org/PYY-ZT7-WMR`.

The website is a convenience layer. The code itself must remain decodable by independent software through the published algorithm, specification and conformance vectors, with no dependency on a central service.

> **Neutral by design**
> Decoding produces WGS84 coordinates that can be handed to the user's mapping application. placepin.org does not need to own or favour a map provider.

> **Codes are identifiers, not distance metrics (normative note)**
> Suffix-sharing implies containment: `PYY-ZT7-WMR` lies inside `ZT7-WMR`, which lies inside `WMR`. **Prefix-sharing implies nothing at all** — two codes that start with the same local block can be, and usually are, continents apart, because a local block is only meaningful relative to the specific area it's paired with. Software MUST NOT infer distance or containment from *any* string similarity other than a genuine right-anchored suffix match, and product copy should avoid teaching users to.

---

## 09 · Try it

### Live reference implementation

The live demo implements §03/§04 exactly — 30-character alphabet, cycling apportionment, snapped bounds, WGS84 normalization, local-first block order — and validates against every Appendix A vector. Clicking the map draws three nested boxes — the local block's ≈5 m leaf cell, the area block's ≈840 m area around it, and the region block's ≈137 km area around that — colour-coded from terracotta (most specific) to pale (least specific), with a table breaking down each valid precision tier and its footprint. Paste a full 9-character code, or just a 3- or 6-character code taken from the **right-hand end**, and the demo decodes as many blocks as you gave it and jumps the map to that cell.

The demo is drawn in a soft-cartography style: warm parchment tones, a muted CARTO Voyager basemap, and serif type — legible against a map without competing with it.

> **What it demonstrates**
> A full coordinate → code → coordinate round trip at all three levels; the nesting guarantee rendered visually; that a coarser code is valid from the right-hand end and not the left; rejection of invalid characters and of lengths that aren't 3, 6 or 9 characters; and the absence of any precompute step — every click computes fresh, in place, with no loading state.

---

## 10 · Versioning, prior art & open questions

### Versioning & freeze policy (normative)

The grid, alphabet and encoding defined in this document together constitute **placepin protocol v5 (draft)**. Nothing emitted before v5-final is a durable code. Once v5 is frozen, the alphabet, partition routine, tie-break rule, normalization, and **block write-order** are all **immutable** — changing any of them changes the geographic meaning of existing codes and therefore requires a new protocol version with a *visibly different* form, never a silent reinterpretation. v1→v2 violated this principle once already (same nine-character shape, different meanings); v4→v5 stays on the right side of it by making the reordering a visibly different, *incompatible* string for the same point (a v4 code fed to a v5 decoder, or vice versa, decodes to the wrong location rather than silently "working" — implementers MUST treat v4 and v5 codes as non-interchangeable without an explicit version tag until one revision is chosen as final).

### Why not an existing system? (positioning)

An open spec owes implementers this comparison:

| System | Length | Hierarchical truncation | Decode arithmetic | Word risk | Status |
|---|---|---|---|---|---|
| **placepin v5** | 9 | Yes — 3/6/9 all valid from the coarse (right-hand) end | Float (binary64 profile + vectors) | None (no vowels) | This draft |
| Plus Codes (OLC) | 10–11 | Partial (padding form) | Integer | None | Open, shipped in Google Maps |
| what3words | 3 words | No | Proprietary | Inherent | Closed, commercial |
| Geohash | 6–12 | Yes (prefix) | Integer | Yes (vowels present) | Open, de facto |

placepin's claim to exist rests on: shorter spoken form than Plus Codes at comparable precision, uniform 3–3–3 rhythm with every truncation a first-class address, a local-first write order suited to proximity-aware input, and near-equal-area cells. Its honest disadvantages: no built-in error detection (a deliberate simplicity trade-off, §06), floating-point conformance burden (mitigated by vectors, removable by a future integer respec), a truncation direction (right-to-left) that's less familiar than Geohash's or Plus Codes' left-to-right prefixing, and a from-zero adoption curve.

### Decisions still to freeze

| Item | Status |
|---|---|
| Final human-safe alphabet | **v5 candidate fixed** (30 chars, vowel-free); speech/handwriting trials and the Y question (§02) remain before freeze |
| Exact grid / projection | **resolved** — recursive latitude-adaptive equal-area partition with cycling largest-remainder apportionment, deterministic tie-breaks, snapped bounds (§03) |
| Block write-order | **changed in v5** — local → area → region (finest to coarsest); considered actively unstable until user testing validates the proximity-search UX it's meant to enable (§00, §Changes) |
| Utilisation invariant | **resolved** — `total == FACTOR` is a MUST |
| Input normalization, datum, boundary ownership | **resolved** — WGS84; lng → [−180, 180); half-open cells with last-row/column snapping (§04) |
| Error detection | **removed since v4** — no check character; applications needing transcription safety should validate in their own UI (§06) |
| Deep-dive precision extension | **documented, not shipped** — mechanism sketched in §05, now prepended rather than appended to match the local-first order; a future revision would need to make it unambiguous from the string alone |
| Proximity-aware local-code search | **not part of this spec** — a product/app-layer feature that resolves a bare local block using approximate location context; explicitly out of scope for `decode()` (§01) |
| Cross-platform determinism | **mitigated, not closed** — binary64 profile + conformance vectors (§03, Appendix A); exact-integer respec remains the long-term fix |
| Reference libraries (JS, Python, …) | JS reference implementation complete and validated against Appendix A; Python and packaged libraries still to build |
| Licensing & governance | **proposed, to ratify** — spec text CC BY 4.0, reference code Apache 2.0, explicit patent grant; protocol identity must survive the domain name (see `GOVERNANCE.md`) |
| Leaf-cell size variance | accepted — ≈4.5–5.1 m at inhabited latitudes, degraded at poles, all stated in §03/§05 |

---

## Appendix A · Canonical conformance vectors

A conforming implementation MUST reproduce every row exactly: same code, same decoded centre (to the printed precision). Inputs are WGS84 degrees; inputs outside the normal range exercise normalization. Codes are written **local-area-region** (v5 order) — each is the same three blocks as the corresponding v4 vector, reversed.

| Input (lat, lng) | Code | Decoded centre (lat, lng) |
|---|---|---|
| 51.507400, −0.127800 | `PYY-ZT7-WMR` | 51.507387, −0.127806 |
| 40.689247, −74.044502 | `S9Q-87F-TS4` | 40.689235, −74.044515 |
| −33.856800, 151.215300 | `C33-6SH-6V8` | −33.856786, 151.215300 |
| 0.000000, 0.000000 | `000-H00-H00` | 0.000023, 0.000023 |
| 90.000000, 0.000000 | `ZZZ-ZZZ-ZZY` | 89.999982, 45.000000 |
| −90.000000, 0.000000 | `000-000-002` | −89.999982, 45.000000 |
| 0.000000, 180.000000 | `000-H00-GV4` | 0.000023, −179.999977 |
| 78.223200, 15.626700 | `P26-HS4-ZPB` | 78.223205, 15.626777 |
| −54.801912, −68.302951 | `1Q7-BKJ-2RG` | −54.801919, −68.302940 |
| 35.689722, 139.692222 | `05Q-7NJ-SX5` | 35.689724, 139.692198 |

Supplementary MUSTs: `encode(0, 180) == encode(0, −180)` (same meridian, one code); a 3- or 6-character **suffix** (the right-hand end) of any row above MUST decode to a box that strictly contains that row's full leaf cell. A 3- or 6-character **prefix** (the left-hand end) of any row above MUST NOT be assumed to decode to anything related to that row — it is expected to resolve to an unrelated cell elsewhere on Earth.

---

*placepin.org specification · canonical 3–3–3 hierarchical alphanumeric address, written local → area → region · v5 — block order flipped; grid, alphabet, encoding and normalization otherwise unchanged from v4 · draft*
