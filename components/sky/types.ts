export type Puff = { x: number; y: number; r: number; alpha: number };

export type Cloud = {
  x: number;
  y: number;
  scale: number;
  depth: number; // 0 = farthest, 1 = nearest
  puffs: Puff[];
};

export type Cirrus = { x: number; y: number; length: number; thickness: number; alpha: number; angle: number };

export type Bird = {
  x: number;
  y: number;
  scale: number;
  alpha: number;
  speedMul: number;
  bobPhase: number;
  bobPeriod: number;
  flapPhase: number;
  flapPeriod: number;
  weavePhase: number;
  weavePeriod: number;
};

export type RenderPuff = {
  sprite: HTMLCanvasElement;
  puff: Puff;
  driftPhaseX: number;
  driftPhaseY: number;
  driftPeriodX: number;
  driftPeriodY: number;
};

export type RenderCloud = {
  cloud: Cloud;
  puffs: RenderPuff[];
  sizeScale: number;
  parallax: number;
  bobPhase: number;
  bobPeriod: number;
  alphaPhase: number;
  alphaPeriod: number;
};
