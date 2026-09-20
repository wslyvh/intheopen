type OutboundEvent = {
  target: string;
  placement: string;
  label?: string;
};

export function outboundEvent({ target, placement, label }: OutboundEvent) {
  const attributes = {
    "data-umami-event": "outbound_click",
    "data-umami-event-target": target,
    "data-umami-event-placement": placement,
  };

  return label
    ? { ...attributes, "data-umami-event-label": label }
    : attributes;
}
