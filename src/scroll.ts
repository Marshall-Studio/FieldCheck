/** Scroll helpers kept pure so navigation regressions can be tested without a browser. */

export function headerOffsetPx(headerHeight: number, padding = 12): number {
  return Math.max(0, headerHeight) + padding;
}

/** Y position that places `targetTop` near the top of the viewport under a sticky header. */
export function viewportTopForElement(absoluteTop: number, headerHeight: number, padding = 12): number {
  return Math.max(0, absoluteTop - headerOffsetPx(headerHeight, padding));
}

/** Scroll offset inside a container so `itemOffset` sits about one-third from the top. */
export function containerScrollForHighlight(itemOffsetFromContainerTop: number, containerScrollTop: number, containerClientHeight: number): number {
  const desired = itemOffsetFromContainerTop + containerScrollTop - containerClientHeight / 3;
  return Math.max(0, desired);
}
