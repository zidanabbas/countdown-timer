// types/timer.ts
export interface TimeFormat {
  d: number;
  h: number;
  m: number;
  s: number;
}

export interface CountdownState {
  timeLeft: number;
  isRunning: boolean;
  isFinished: boolean;
}
