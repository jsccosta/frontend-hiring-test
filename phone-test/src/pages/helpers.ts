import { getValidDate } from "../helpers/dates";

interface GroupedCalls {
  [date: string]: Call[];
}

function groupCallsByDate(calls: Call[]) {
  const groupedCalls: GroupedCalls = {};
  calls.forEach(call => {
    const date = call.created_at.split('T')[0]; // Assuming created_at is a string in ISO format
    if (!groupedCalls[date]) {
      groupedCalls[date] = [];
    }
    groupedCalls[date].push(call);
  });

  const sortedDates = Object.keys(groupedCalls).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const sortedGroupedCalls: GroupedCalls = {};
  sortedDates.forEach(date => {
    sortedGroupedCalls[date] = groupedCalls[date];
  });

  return sortedGroupedCalls;
}

export function groupCallsIntoPages(calls: Call[], pageSize: number) {
  const pages = [];
  for (let i = 0; i < calls.length; i += pageSize) {
    const page = calls.slice(i, i + pageSize);
    const groupedPage = groupCallsByDate(page);
    pages.push(groupedPage);
  }
  return pages;
}

export function filterCalls(calls: Call[], callType: string, direction: string) {
    if (!calls) return [];
    return calls.filter(
      call =>
        (!callType || callType === '' || callType.includes(call.call_type)) &&
        (!direction || direction === '' || call.direction === direction)
    );
  }

  export const sortCallsByDate = (calls: Call[]) =>
    [...calls].sort((a: Call, b: Call) => {
      const dateA = getValidDate(a.created_at).getTime();
      const dateB = getValidDate(b.created_at).getTime();
      return dateB - dateA;
    });