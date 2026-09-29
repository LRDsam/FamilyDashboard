/** Mirrors HueController's HueStatusResponse. */
export interface HueStatus {
  readonly bridgeIp: string | null;
  readonly isPaired: boolean;
}

/** Mirrors HueController's HueDiscoverResponse. */
export interface HueDiscoverResult {
  readonly bridgeIp: string;
}

/** Mirrors HueController's HuePairResponse. */
export interface HuePairResult {
  readonly paired: boolean;
  readonly message: string | null;
}

/**
 * Mirrors HueClient's HueLight record. `brightness` is null for
 * lights/plugs that don't support dimming.
 */
export interface HueLight {
  readonly id: string;
  readonly name: string;
  readonly on: boolean;
  readonly brightness: number | null;
}
