import { useEffect, useState } from "react";
import TimerDisplay from "@/components/TimerDisplay";
import type { TimeFormat } from "@/types/timer";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState<number>(2 * 60 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [audio] = useState<HTMLAudioElement>(() => new Audio("/terompet.mp3"));

  useEffect(() => {
    let timer: number | undefined;

    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      setIsRunning(false);
      audio.play();
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isFinished, audio]);

  const formatTime = (seconds: number): TimeFormat => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h, m, s };
  };

  const handleReset = () => {
    setTimeLeft(2 * 60 * 60);
    setIsRunning(false);
    setIsFinished(false);
    audio.pause();
    audio.currentTime = 0;
  };

  return (
    <div className="w-full relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-black text-white">
      <div className="absolute inset-0 snow"></div>

      {/* Countdown Card */}
      <div className="z-10 w-full max-w-4xl py-12 px-8 rounded-3xl backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.15)] text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-10 tracking-widest drop-shadow-md">
          COUNTDOWN TIMER
        </h1>

        {/* gunakan komponen TimerDisplay */}
        <TimerDisplay time={formatTime(timeLeft)} />

        {/* Tombol kontrol */}
        <div className="flex justify-center gap-6 mt-10">
          {!isRunning && !isFinished && (
            <button
              onClick={() => setIsRunning(true)}
              className="px-8 py-3 bg-green-500/80 hover:bg-green-600 rounded-xl font-semibold transition-all duration-300 shadow-lg"
            >
              Mulai
            </button>
          )}
          {isRunning && (
            <button
              onClick={() => setIsRunning(false)}
              className="px-8 py-3 bg-yellow-500/80 hover:bg-yellow-600 rounded-xl font-semibold transition-all duration-300 shadow-lg"
            >
              Jeda
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-red-500/80 hover:bg-red-600 rounded-xl font-semibold transition-all duration-300 shadow-lg"
          >
            Reset
          </button>
        </div>

        {isFinished && (
          <p className="mt-8 text-2xl font-semibold animate-pulse">
            🎉 Waktu Habis! 🎶
          </p>
        )}
      </div>
    </div>
  );
}
