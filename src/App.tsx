import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60); // 2 jam (dalam detik)
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [audio] = useState(() => new Audio("/terompet.mp3"));

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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h, m, s };
  };

  const { h, m, s } = formatTime(timeLeft);

  const handleReset = () => {
    setTimeLeft(2 * 60 * 60);
    setIsRunning(false);
    setIsFinished(false);
    audio.pause();
    audio.currentTime = 0;
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-black text-white">
      {/* efek salju */}
      <div className="absolute inset-0 snow"></div>

      {/* Glass bar countdown */}
      <div className="z-10 w-[90%] md:w-[80%] xl:w-[70%] py-12 px-8 rounded-3xl backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.15)]">
        <h1 className="text-center text-2xl md:text-3xl font-bold mb-10 tracking-widest drop-shadow-md">
          COUNTDOWN TIMER
        </h1>

        {/* Waktu (rata horizontal penuh) */}
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 py-8 rounded-2xl">
            <p className="text-6xl md:text-7xl font-bold">
              {h.toString().padStart(2, "0")}
            </p>
            <p className="text-sm tracking-widest opacity-80 mt-2">HOURS</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 py-8 rounded-2xl">
            <p className="text-6xl md:text-7xl font-bold">
              {m.toString().padStart(2, "0")}
            </p>
            <p className="text-sm tracking-widest opacity-80 mt-2">MINUTES</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 py-8 rounded-2xl">
            <p className="text-6xl md:text-7xl font-bold">
              {s.toString().padStart(2, "0")}
            </p>
            <p className="text-sm tracking-widest opacity-80 mt-2">SECONDS</p>
          </div>
        </div>

        {/* Tombol */}
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
          <p className="mt-8 text-2xl font-semibold animate-pulse text-center">
            🎉 Waktu Habis! 🎶
          </p>
        )}
      </div>
    </div>
  );
}
