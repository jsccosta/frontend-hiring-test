export interface CallGroup {
  [date: string]: Call[];
}

export type CallFilterBarProps = {
    callTypeSelectionChange: (newSelection: string) => void;
    callDirectionSelectionChange: (newSelection: string) => void;
  };