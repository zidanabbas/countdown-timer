import { useEffect, useRef, useState } from "react";
import TimerDisplay from "@/components/TimerDisplay";
import type { TimeFormat } from "@/types/timer";
import EndDisplay from "@/components/EndDisplay";

// types
type Star = { x: number; y: number; z: number };

export default function Home() {
  const [inputDays, setInputDays] = useState<number>(0);
  const [inputHours, setInputHours] = useState<number>(0);
  const [inputMinutes, setInputMinutes] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(2 * 60 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [audio] = useState<HTMLAudioElement>(() => new Audio("/wfl.mp3"));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // fungsi hitung total detik dari input user
  const calculateTimeLeft = () =>
    inputDays * 24 * 3600 + inputHours * 3600 + inputMinutes * 60;

  const handleSetTimer = () => {
    const total = calculateTimeLeft();
    setTimeLeft(total);
    setIsFinished(false);
    setIsRunning(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d")!;
    if (!context) return;

    const STAR_COLOR = "#fff";
    const STAR_SIZE = 3;
    const STAR_MIN_SCALE = 0.2;
    const OVERFLOW_THRESHOLD = 50;
    const STAR_COUNT = (window.innerWidth + window.innerHeight) / 8;

    let scale = window.devicePixelRatio || 1;
    let width = window.innerWidth * scale;
    let height = window.innerHeight * scale;

    canvas!.width = width;
    canvas!.height = height;

    const stars: Star[] = [];
    let pointerX: number | null = null;
    let pointerY: number | null = null;
    const velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };
    let touchInput = false;

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
      });
    }

    function recycleStar(star: Star) {
      star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);
      star.x = Math.random() * width;
      star.y = Math.random() * height;
    }

    function resize() {
      scale = window.devicePixelRatio || 1;
      width = window.innerWidth * scale;
      height = window.innerHeight * scale;
      canvas!.width = width;
      canvas!.height = height;
    }

    function update() {
      velocity.tx *= 0.96;
      velocity.ty *= 0.96;
      velocity.x += (velocity.tx - velocity.x) * 0.8;
      velocity.y += (velocity.ty - velocity.y) * 0.8;

      stars.forEach((star) => {
        star.x += velocity.x * star.z;
        star.y += velocity.y * star.z;
        star.x += (star.x - width / 2) * velocity.z * star.z;
        star.y += (star.y - height / 2) * velocity.z * star.z;
        star.z += velocity.z;

        if (
          star.x < -OVERFLOW_THRESHOLD ||
          star.x > width + OVERFLOW_THRESHOLD ||
          star.y < -OVERFLOW_THRESHOLD ||
          star.y > height + OVERFLOW_THRESHOLD
        ) {
          recycleStar(star);
        }
      });
    }

    function render() {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        context.beginPath();
        context.lineCap = "round";
        context.lineWidth = STAR_SIZE * star.z * scale;
        context.globalAlpha = 0.5 + 0.5 * Math.random();
        context.strokeStyle = STAR_COLOR;

        const tailX = velocity.x * 2;
        const tailY = velocity.y * 2;

        context.moveTo(star.x, star.y);
        context.lineTo(star.x + tailX, star.y + tailY);
        context.stroke();
      });
    }

    function step() {
      update();
      render();
      requestAnimationFrame(step);
    }

    function movePointer(x: number, y: number) {
      if (pointerX !== null && pointerY !== null) {
        const ox = x - pointerX;
        const oy = y - pointerY;
        velocity.tx += (ox / 4) * (touchInput ? 1 : -1);
        velocity.ty += (oy / 4) * (touchInput ? 1 : -1);
      }
      pointerX = x;
      pointerY = y;
    }

    function onMouseMove(event: MouseEvent) {
      touchInput = false;
      movePointer(event.clientX, event.clientY);
    }

    function onTouchMove(event: TouchEvent) {
      touchInput = true;
      movePointer(event.touches[0].clientX, event.touches[0].clientY);
      event.preventDefault();
    }

    function onMouseLeave() {
      pointerX = null;
      pointerY = null;
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    document.addEventListener("mouseleave", onMouseLeave);

    step();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

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
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { d, h, m, s };
  };

  const handleReset = () => {
    setTimeLeft(2 * 60 * 60);
    setIsRunning(false);
    setIsFinished(false);
    audio.pause();
    audio.currentTime = 0;
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden text-white">
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full bg-black"
      />

      {/* Gradient Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(121,68,154,0.13),transparent),radial-gradient(circle_at_20%_80%,rgba(41,196,255,0.13),transparent)] pointer-events-none"></div>

      {/* Timer Input */}
      <div className="z-20 flex gap-3 mb-6">
        <input
          type="number"
          min={0}
          value={inputDays === 0 ? "" : inputDays}
          onChange={(e) => setInputDays(Number(e.target.value))}
          onBlur={() => {
            if (inputDays === 0) setInputDays(1);
          }}
          placeholder="Hari"
          className="w-20 px-2 py-1 rounded text-black text-center"
        />
        <input
          type="number"
          min={0}
          max={23}
          value={inputHours === 0 ? "" : inputHours}
          onChange={(e) => setInputHours(Number(e.target.value))}
          onBlur={() => {
            if (inputHours === 0) setInputHours(1);
          }}
          placeholder="Jam"
          className="w-20 px-2 py-1 rounded text-black text-center"
        />
        <input
          type="number"
          min={0}
          max={59}
          value={inputMinutes === 0 ? "" : inputMinutes}
          onChange={(e) => setInputMinutes(Number(e.target.value))}
          onBlur={() => {
            if (inputMinutes === 0) setInputMinutes(1);
          }}
          placeholder="Menit"
          className="w-20 px-2 py-1 rounded text-black text-center"
        />
        <button
          onClick={handleSetTimer}
          className="px-4 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white font-semibold"
        >
          Set Timer
        </button>
      </div>

      {/* Timer Card */}
      <div className="z-10 w-full max-w-4xl py-12 px-8 rounded-3xl backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.15)] text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-10 tracking-widest drop-shadow-md">
          COUNTDOWN TIMER
        </h1>

        {isFinished ? (
          <EndDisplay />
        ) : (
          <TimerDisplay time={formatTime(timeLeft)} />
        )}

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

        <div className="mt-2">
          <p className="text-xs text-end font-semibold text-white">
            Copyright by zidane abbas
          </p>
        </div>
      </div>
    </div>
  );
}
