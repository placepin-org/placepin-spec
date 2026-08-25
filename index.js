/**
 * @placepin/vectors — the conformance fixtures, as data.
 *
 * Spec §03: conformance is defined by these vectors, not by the prose, because
 * sin/cos/sqrt are not bit-identical across platforms. Every implementation
 * consumes this same artifact rather than transcribing Appendix A by hand —
 * including the reference implementation, which gets no special standing.
 *
 * There is deliberately no logic in this package. It is a fixture, not a
 * library: anything that could disagree with the spec would be a second source
 * of truth.
 */

import doc from './vectors.json' with { type: 'json' };

/** The full document, including constants and the supplementary MUSTs. */
export default doc;

/** The ten canonical vectors. */
export const VECTORS = doc.vectors;

/** Alphabet, base, factor, Earth radius, datum. Assert against these first. */
export const CONSTANTS = doc.constants;

/** The four MUSTs that aren't a single row. */
export const SUPPLEMENTARY = doc.supplementary;

/**
 * Which protocol revision these fixtures describe.
 *
 * §10: v4 and v5 codes are not interchangeable, and a mismatch decodes to the
 * wrong location rather than failing. Check this before trusting a stored code.
 */
export const REVISION = doc.revision;
