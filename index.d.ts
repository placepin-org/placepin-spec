export interface LatLng {
  lat: number;
  lng: number;
}

export interface ConformanceVector {
  /** The coordinate handed to encode(). May be outside normal range, to exercise normalization. */
  input: LatLng;
  /** The code encode() MUST produce. */
  code: string;
  /** The centre decode() MUST return, to six decimal places. */
  centre: LatLng;
}

export interface Constants {
  /** 30 characters: no vowels, no L. */
  alphabet: string;
  base: number;
  /** 30³ — one block's address space. */
  factor: number;
  earthRadiusM: number;
  datum: 'WGS84';
}

export interface Supplementary {
  antimeridian: { $comment: string; lng180EqualsMinus180: boolean };
  suffixContainment: { $comment: string; holds: boolean };
  prefixUnrelated: { $comment: string; holds: boolean };
  partitionInvariant: { $comment: string; totalEqualsFactor: boolean };
}

export interface VectorDocument {
  $comment: string;
  protocol: 'placepin';
  revision: string;
  spec: string;
  constants: Constants;
  vectors: ConformanceVector[];
  supplementary: Supplementary;
}

declare const doc: VectorDocument;
export default doc;

export const VECTORS: ConformanceVector[];
export const CONSTANTS: Constants;
export const SUPPLEMENTARY: Supplementary;
export const REVISION: string;
