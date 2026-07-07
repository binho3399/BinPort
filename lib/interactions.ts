export const interactionEventNames = {
  cursorEnter: 'signal-pole:cursor-enter',
  cursorLeave: 'signal-pole:cursor-leave',
  cursorReset: 'signal-pole:cursor-reset',
  entered: 'signal-pole:entered',
  modelPortalStart: 'signal-pole:model-portal-start',
} as const;

export type InteractionEventName = keyof typeof interactionEventNames;

export type CursorEnterDetail = {
  label?: string;
  showArrow?: boolean;
};

export type ModelPortalStartDetail = {
  href: string;
  materialName: string;
  clientX: number;
  clientY: number;
};

type InteractionEventPayloads = {
  cursorEnter: CursorEnterDetail;
  cursorLeave: undefined;
  cursorReset: undefined;
  entered: undefined;
  modelPortalStart: ModelPortalStartDetail;
};

type InteractionEventMap = {
  [K in InteractionEventName]: CustomEvent<InteractionEventPayloads[K]>;
};

export function createInteractionEvent<K extends InteractionEventName>(
  name: K,
  detail?: InteractionEventPayloads[K],
) {
  return new CustomEvent(interactionEventNames[name], detail === undefined ? undefined : { detail });
}

export function emitInteractionEvent<K extends InteractionEventName>(
  target: Window | Document | HTMLElement,
  name: K,
  detail?: InteractionEventPayloads[K],
) {
  target.dispatchEvent(createInteractionEvent(name, detail as never));
}

export function onInteractionEvent<K extends InteractionEventName>(
  target: Window | Document | HTMLElement,
  name: K,
  handler: (event: InteractionEventMap[K]) => void,
) {
  target.addEventListener(interactionEventNames[name], handler as EventListener);
}

export function offInteractionEvent<K extends InteractionEventName>(
  target: Window | Document | HTMLElement,
  name: K,
  handler: (event: InteractionEventMap[K]) => void,
) {
  target.removeEventListener(interactionEventNames[name], handler as EventListener);
}
