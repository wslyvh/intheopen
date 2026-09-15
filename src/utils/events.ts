import eventData from "@/utils/events.json";

export type Event = {
  title: string;
  url: string;
  date: string;
  endDate?: string;
  location: string;
};

const events = eventData satisfies Event[];

function dateInAmsterdam(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function upcomingEvents(now = new Date()) {
  const today = dateInAmsterdam(now);

  return events
    .filter((event) => (event.endDate ?? event.date) >= today)
    .toSorted((a, b) => a.date.localeCompare(b.date));
}
