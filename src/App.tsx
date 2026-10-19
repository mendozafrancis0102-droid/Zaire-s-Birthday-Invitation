import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Baby, 
  Shirt, 
  DollarSign, 
  BookOpen, 
  Send, 
  PartyPopper, 
  Volume2, 
  VolumeX, 
  Navigation, 
  Check, 
  Smile, 
  Users, 
  MessageCircle, 
  ExternalLink, 
  Share2, 
  CalendarPlus 
} from 'lucide-react';

interface WishItem {
  id: string;
  name: string;
  attendance: 'yes' | 'no';
  guests: number;
  message: string;
  createdAt?: number;
  timestamp?: string;
  time?: string;
}

// Real-time relative timestamp renderer ("Just now", "1 min ago", "5 mins ago", "2 hours ago", "1 day ago")
const formatRelativeTime = (timestamp?: number | string, fallbackTime?: string): string => {
  if (!timestamp) {
    return fallbackTime || 'Just now';
  }
  const timeMs = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(timeMs) || timeMs <= 0) {
    return fallbackTime || 'Just now';
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - timeMs);
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 30) return 'Just now';
  if (diffSec < 60) return `${diffSec} seconds ago`;
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} mins ago`;
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  
  const diffYears = Math.floor(diffDays / 365);
  if (diffYears === 1) return '1 year ago';
  return `${diffYears} years ago`;
};

// Iconic CoComelon 3D Bubbly Color Sequence (Red, Orange, Yellow, Green, Light Blue, Deep Blue, Purple)
interface CocomelonColorDef {
  base: string;
  gloss: string;
  deep: string;
}

const COCOMELON_COLORS: CocomelonColorDef[] = [
  { base: '#FF2A55', gloss: '#FFAEC0', deep: '#D10028' }, // Red
  { base: '#FF8000', gloss: '#FFD39B', deep: '#CC6600' }, // Orange
  { base: '#FFCC00', gloss: '#FFF4A3', deep: '#D4A400' }, // Yellow
  { base: '#72D02B', gloss: '#C7F7A2', deep: '#529E19' }, // Green
  { base: '#00C4FF', gloss: '#A6F1FF', deep: '#0097C7' }, // Light Blue
  { base: '#0072FF', gloss: '#99C7FF', deep: '#004EC2' }, // Deep Blue
  { base: '#8F33FF', gloss: '#D6AFFF', deep: '#6917D9' }  // Purple
];

// Playful organic tilts for bouncy toy logo rhythm
const COCOMELON_TILTS = [-2.2, 1.8, -1.5, 2.4, -1.8, 1.4, -2.0, 2.2, -1.2, 1.6];

const CocomelonBubblyText: React.FC<{ 
  text: string; 
  startIndex?: number; 
  className?: string; 
}> = ({ text, startIndex = 0, className = '' }) => {
  const words = text.split(' ');
  let letterCounter = startIndex;

  return (
    <span className={`inline-flex flex-wrap justify-center items-center gap-x-2 sm:gap-x-3.5 gap-y-1 font-cocomelon ${className}`}>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-flex items-baseline whitespace-nowrap">
          {word.split('').map((char, charIdx) => {
            const colorIdx = letterCounter % COCOMELON_COLORS.length;
            const tilt = COCOMELON_TILTS[letterCounter % COCOMELON_TILTS.length];
            const color = COCOMELON_COLORS[colorIdx];
            letterCounter++;

            return (
              <span
                key={charIdx}
                className="cocomelon-letter-wrap tracking-wide"
                style={{
                  transform: `rotate(${tilt}deg)`,
                  margin: '0 0.5px'
                }}
              >
                {/* Thick white outline & 3D shadow layer */}
                <span className="cocomelon-letter-stroke" aria-hidden="true">
                  {char}
                </span>

                {/* Glossy 3D color fill layer with white specular highlight */}
                <span
                  className="cocomelon-letter-fill"
                  style={{
                    backgroundImage: `linear-gradient(180deg, #FFFFFF 0%, ${color.gloss} 18%, ${color.base} 55%, ${color.deep} 100%)`
                  }}
                >
                  {char}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
};

export default function App() {
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [submittedGuestInfo, setSubmittedGuestInfo] = useState<{ name: string; attendance: 'yes' | 'no'; count: number } | null>(null);
  const [guestName, setGuestName] = useState('');
  const [attendance, setAttendance] = useState<'yes' | 'no'>('yes');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [photoSrc, setPhotoSrc] = useState<string>('/zaire_above_chest.jpg');
  const [copiedLink, setCopiedLink] = useState(false);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);
  const [, setNowTick] = useState(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const loopTimeoutRef = useRef<number | null>(null);

  // Countdown timer to October 31, 2026, 1:00 PM (13:00)
  useEffect(() => {
    const eventDate = new Date('2026-10-31T13:00:00+08:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Continuous background melody playback loop
  const playMelodyCycle = () => {
    if (!isPlayingRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Happy Birthday xylophone / chime notes sequence
      const notes = [
        261.63, 261.63, 293.66, 261.63, 349.23, 329.63,
        261.63, 261.63, 293.66, 261.63, 392.00, 349.23,
        261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66,
        466.16, 466.16, 440.00, 349.23, 392.00, 349.23
      ];
      const durations = [
        0.35, 0.35, 0.7, 0.7, 0.7, 1.1,
        0.35, 0.35, 0.7, 0.7, 0.7, 1.1,
        0.35, 0.35, 0.7, 0.7, 0.7, 0.7, 1.1,
        0.35, 0.35, 0.7, 0.7, 0.7, 1.3
      ];

      let time = ctx.currentTime + 0.1;
      let totalDuration = 0;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.16, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + durations[idx]);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + durations[idx]);
        time += durations[idx];
        totalDuration += durations[idx];
      });

      // Schedule next continuous loop iteration with a gentle pause
      loopTimeoutRef.current = window.setTimeout(() => {
        if (isPlayingRef.current) {
          playMelodyCycle();
        }
      }, (totalDuration + 1.2) * 1000);

    } catch (e) {
      console.warn('Audio play cycle error:', e);
    }
  };

  const startMusic = () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    setIsPlayingMusic(true);
    playMelodyCycle();
  };

  const stopMusic = () => {
    isPlayingRef.current = false;
    setIsPlayingMusic(false);
    if (loopTimeoutRef.current) {
      window.clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.suspend().catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (isPlayingMusic) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  // Autoplay music as soon as user visits or interacts with the website
  useEffect(() => {
    // Attempt automatic start
    startMusic();

    // Browser autoplay policy unlocks upon first user gesture (touch, scroll, click)
    const handleFirstInteraction = () => {
      if (!isPlayingRef.current) {
        startMusic();
      } else if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('scroll', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      if (loopTimeoutRef.current) {
        window.clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  // Real-time dynamic ticker: updates relative times ("just now", "15 seconds ago", "2 mins ago") every 1s
  useEffect(() => {
    const ticker = setInterval(() => {
      setNowTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // Load custom photo
  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem('zaire_birthday_custom_photo');
      if (savedPhoto && savedPhoto.startsWith('data:image')) {
        setPhotoSrc(savedPhoto);
      } else {
        fetch('/api/photo')
          .then((res) => res.json())
          .then((data) => {
            if (data && data.photo) {
              setPhotoSrc(data.photo);
            } else {
              setPhotoSrc('/zaire_above_chest.jpg');
            }
          })
          .catch(() => {
            setPhotoSrc('/zaire_above_chest.jpg');
          });
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Real-time live wishes synchronization (polls every 3 seconds)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('zaire_birthday_wishes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Exclude any obsolete sample/mock wishes
          const realOnly = parsed.filter((w: WishItem) => !w.id?.startsWith('wish_sample_'));
          setWishes(realOnly);
          localStorage.setItem('zaire_birthday_wishes', JSON.stringify(realOnly));
        }
      }
    } catch (e) {
      console.warn(e);
    }

    const fetchWishes = () => {
      fetch('/api/wishes')
        .then((res) => res.json())
        .then((data: WishItem[]) => {
          if (Array.isArray(data)) {
            const realOnly = data.filter((w: WishItem) => !w.id?.startsWith('wish_sample_'));
            setWishes(realOnly);
            try {
              localStorage.setItem('zaire_birthday_wishes', JSON.stringify(realOnly));
            } catch (e) {
              console.warn(e);
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoadingWishes(false);
        });
    };

    fetchWishes();
    const interval = setInterval(fetchWishes, 3000);
    return () => clearInterval(interval);
  }, []);

  // Confetti celebration launcher
  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#ec4899', '#a855f7']
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#facc15', '#10b981', '#38bdf8']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#f43f5e', '#a855f7', '#fbbf24']
        });
      }, 250);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    setIsSubmittingRsvp(true);

    const now = Date.now();
    const isoString = new Date(now).toISOString();
    const finalName = guestName.trim();
    const finalAttendance = attendance;
    const finalGuests = finalAttendance === 'yes' ? guestCount : 0;
    const finalStatus = finalAttendance === 'yes' ? 'Joyfully Accepts' : 'Regretfully Declines';
    const finalWish = message.trim() || (finalAttendance === 'yes' ? "Can't wait to celebrate with Zaire! 🎉" : "Best wishes to baby Zaire! ❤️");

    // Formspree submission payload with matching field names
    const formspreePayload = {
      fullName: finalName,
      attendingStatus: finalStatus,
      guestCount: finalGuests,
      birthdayWish: finalWish,
      submittedAt: isoString
    };

    // 1. Submit to Formspree via POST
    try {
      await fetch('https://formspree.io/f/xgaoqlyl', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formspreePayload)
      });
    } catch (formspreeErr) {
      console.warn('Formspree submission error:', formspreeErr);
    }

    // 2. Also save to live guestbook wall and internal server
    const localNewWish: WishItem = {
      id: now.toString(),
      name: finalName,
      attendance: finalAttendance,
      guests: finalGuests,
      message: finalWish,
      createdAt: now,
      timestamp: isoString,
      time: 'Just now'
    };

    const updatedWishes = [localNewWish, ...wishes];
    setWishes(updatedWishes);
    try {
      localStorage.setItem('zaire_birthday_wishes', JSON.stringify(updatedWishes));
    } catch (err) {
      console.warn(err);
    }

    try {
      await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalName,
          attendance: finalAttendance,
          guests: finalGuests,
          message: finalWish,
          createdAt: now,
          timestamp: isoString
        })
      });
    } catch (error) {
      console.warn("Backend wish save fallback:", error);
    }

    setSubmittedGuestInfo({
      name: finalName,
      attendance: finalAttendance,
      count: finalGuests
    });
    setRsvpSubmitted(true);
    setIsSubmittingRsvp(false);
    fireConfetti();
  };

  const copyInvitationLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.warn('Could not copy link', err);
    }
  };

  // Google Calendar URL updated for 1:00 PM (13:00 Manila = 05:00 UTC)
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Zaire's 1st Birthday Party 🍉")}&dates=20261031T050000Z/20261031T090000Z&details=${encodeURIComponent("Join us in celebrating baby Zaire's 1st Birthday! Theme: CoComelon. Venue: McDonald's Arcovia City, Pasig.")}&location=${encodeURIComponent("McDonald's, Block 7 Lot 2, Arcovia City, Pasig, 1604 Metro Manila")}`;

  // Download .ics for Apple / Outlook Calendar updated for 1:00 PM
  const downloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Zaire 1st Birthday//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Zaire's 1st Birthday Party 🍉
DESCRIPTION:Join us for Zaire's CoComelon 1st Birthday Celebration!
LOCATION:McDonald's, Block 7 Lot 2, Arcovia City, Pasig, 1604 Metro Manila
DTSTART:20261031T050000Z
DTEND:20261031T090000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'zaire-1st-birthday.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans relative overflow-x-hidden pb-24 bg-sky-200">
      
      {/* ============================================================ */}
      {/* VIVID COCOMELON SCENERY BACKGROUND */}
      {/* ============================================================ */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center md:bg-top bg-no-repeat opacity-95 filter contrast-105 saturate-115 brightness-102"
        style={{ 
          backgroundImage: `url('/cocomelon_vivid_landscape.jpg')`
        }}
      />

      {/* Localized backlight wash for high contrast card legibility */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial from-white/30 via-transparent to-black/10" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md border-b-4 border-yellow-400 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl shadow-md border-2 border-white">
            🍉
          </div>
          <div>
            <h1 className="font-black text-emerald-700 text-sm sm:text-base leading-tight uppercase tracking-wide">
              Zaire's 1st Birthday
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-bold">CoComelon Celebration!</p>
          </div>
        </div>
        <div className="text-xs font-black text-emerald-700 bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-300">
          Saturday, Oct 31 • 1:00 PM
        </div>
      </header>

      {/* ============================================================ */}
      {/* FLOATING ACTION BUTTONS DOCK (STICKY BOTTOM-RIGHT AS YOU SCROLL) */}
      {/* Music button, Confetti button, and Share button follow as you scroll */}
      {/* ============================================================ */}
      <aside 
        aria-label="Floating party controls"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2.5 select-none"
      >
        {/* Continuous Birthday Song Toggle Button */}
        <button 
          onClick={toggleMusic}
          aria-label={isPlayingMusic ? "Pause party music" : "Play party music"}
          className={`flex items-center gap-2 rounded-full px-4 py-3 text-xs sm:text-sm font-black transition-all shadow-2xl border-3 border-white cursor-pointer transform hover:scale-105 active:scale-95 ${
            isPlayingMusic 
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white animate-pulse ring-4 ring-emerald-300/60' 
              : 'bg-yellow-300 text-slate-900 hover:bg-yellow-400 ring-2 ring-yellow-400/50'
          }`}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-5 h-5 animate-bounce" />
              <span>Playing Song 🎶</span>
            </>
          ) : (
            <>
              <VolumeX className="w-5 h-5 text-slate-700" />
              <span>Play Song 🎵</span>
            </>
          )}
        </button>

        {/* Floating Confetti Cannon Button */}
        <button 
          onClick={fireConfetti}
          aria-label="Launch confetti celebration"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-4 py-3 text-xs sm:text-sm font-black text-white shadow-2xl border-3 border-white transition-all hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-pink-300/60"
        >
          <Sparkles className="w-5 h-5 animate-spin-slow" />
          <span>Confetti! 🎉</span>
        </button>

        {/* Floating Share Button (Positioned on the bottom of the Confetti Button) */}
        <button 
          onClick={copyInvitationLink}
          aria-label="Share invitation link"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 px-4 py-3 text-xs sm:text-sm font-black text-white shadow-2xl border-3 border-white transition-all hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-sky-300/60"
          title="Share invitation link"
        >
          {copiedLink ? <Check className="w-5 h-5 text-yellow-300" /> : <Share2 className="w-5 h-5" />}
          <span>{copiedLink ? 'Copied Link! 📋' : 'Share 💌'}</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6 text-center relative z-10">
        
        {/* Banner Tag */}
        <div className="inline-flex items-center space-x-2 bg-yellow-400 text-slate-900 px-5 py-2 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider mb-4 shadow-xl border-2 border-white">
          <span className="text-base">🍉</span>
          <span>You're Invited to Zaire's 1st Birthday!</span>
          <span className="text-base">🍉</span>
        </div>

        {/* Hero Header Titles in Iconic Bubbly 3D CoComelon Logo Text */}
        <div className="mb-6 select-none">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-2 sm:mb-3 leading-tight tracking-tight">
            <CocomelonBubblyText text="Join Us and Celebrate" startIndex={0} />
          </h1>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight flex items-center justify-center flex-wrap gap-2">
            <CocomelonBubblyText text="Zaire Jace's 1st Birthday!" startIndex={4} />
            <span className="inline-block transform hover:scale-125 hover:rotate-12 transition-transform duration-200 text-3xl sm:text-5xl md:text-6xl drop-shadow-md select-none ml-1">
              🎂
            </span>
          </h2>
        </div>

        {/* ============================================================ */}
        {/* HERO SECTION: LOCKED PERMANENT PHOTO OF BABY ZAIRE */}
        {/* ============================================================ */}
        <div className="flex flex-col items-center justify-center mb-8">
          
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-92 md:h-92 mx-auto select-none pointer-events-none">
            
            {/* Rainbow Glowing Outer Ring */}
            <div className="absolute -inset-4 sm:-inset-5 bg-gradient-to-r from-red-500 via-yellow-400 via-emerald-400 via-sky-400 to-pink-500 rounded-full animate-spin-slow opacity-95 blur-xs shadow-2xl"></div>
            
            {/* Photo Container - Kept strictly above the chest only */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-8 border-white shadow-2xl bg-gradient-to-b from-yellow-200 to-sky-200 flex items-center justify-center pointer-events-none">
              <img 
                src={photoSrc} 
                alt="Birthday Boy Zaire" 
                className="w-full h-full object-cover select-none pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/zaire_above_chest.jpg";
                }}
              />
            </div>

            {/* CoComelon Watermelon TV Badge */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-5 py-2 shadow-2xl border-4 border-emerald-400 flex items-center space-x-2 whitespace-nowrap pointer-events-none">
              <span className="text-2xl">🍉</span>
              <span className="font-black text-xs sm:text-sm text-emerald-800 uppercase tracking-wide">
                Baby Zaire • Turning 1
              </span>
            </div>
          </div>

          <p className="mt-6 text-slate-900 font-black text-base sm:text-lg bg-white/95 backdrop-blur-xs py-1.5 px-6 rounded-full shadow-lg inline-block border-2 border-emerald-400">
            Zaire is turning 1! Join the fun with us! 🎈
          </p>

          {/* Quick Calendar Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-emerald-50 text-emerald-700 font-black text-xs px-4 py-2 rounded-xl shadow-lg border-2 border-emerald-400 transition transform hover:scale-105"
            >
              <CalendarPlus className="w-4 h-4 text-emerald-600" />
              <span>Add to Google Calendar (1:00 PM)</span>
            </a>
            
            <button
              onClick={downloadIcs}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-sky-50 text-sky-700 font-black text-xs px-4 py-2 rounded-xl shadow-lg border-2 border-sky-400 transition transform hover:scale-105 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Apple / Outlook (.ics)</span>
            </button>
          </div>
        </div>

        {/* Countdown Timer (Targeting 1:00 PM) */}
        <div className="max-w-xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border-4 border-emerald-400 mb-8">
          <p className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600 animate-spin-slow" /> 
            <span>Countdown to 1:00 PM Party Time</span>
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-emerald-100 rounded-2xl p-3 border-2 border-emerald-300 text-center shadow-inner">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-800">{timeLeft.days}</span>
              <span className="text-[10px] sm:text-xs uppercase font-extrabold text-emerald-700">Days</span>
            </div>
            <div className="bg-yellow-100 rounded-2xl p-3 border-2 border-yellow-300 text-center shadow-inner">
              <span className="block text-2xl sm:text-3xl font-black text-yellow-800">{timeLeft.hours}</span>
              <span className="text-[10px] sm:text-xs uppercase font-extrabold text-yellow-700">Hours</span>
            </div>
            <div className="bg-pink-100 rounded-2xl p-3 border-2 border-pink-300 text-center shadow-inner">
              <span className="block text-2xl sm:text-3xl font-black text-pink-800">{timeLeft.minutes}</span>
              <span className="text-[10px] sm:text-xs uppercase font-extrabold text-pink-700">Mins</span>
            </div>
            <div className="bg-sky-100 rounded-2xl p-3 border-2 border-sky-300 text-center shadow-inner">
              <span className="block text-2xl sm:text-3xl font-black text-sky-800">{timeLeft.seconds}</span>
              <span className="text-[10px] sm:text-xs uppercase font-extrabold text-sky-700">Secs</span>
            </div>
          </div>
        </div>

        {/* Event Details Card - Updated for 1:00 PM */}
        <div className="max-w-2xl mx-auto bg-white/98 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-400 text-left mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 font-black text-[11px] px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow">
            Party Venue 🍔🍟
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 flex items-center space-x-2 border-b-2 border-yellow-100 pb-3">
            <span>🎉 Party Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            
            {/* Event Date */}
            <div className="flex items-start space-x-3.5 bg-yellow-50/90 p-3.5 rounded-2xl border border-yellow-200">
              <div className="bg-yellow-400 p-3 rounded-2xl text-slate-900 shadow border-2 border-white shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Date</h4>
                <p className="text-base sm:text-lg font-black text-slate-900">Saturday, October 31, 2026</p>
                <p className="text-xs font-semibold text-emerald-700">Halloween Weekend Celebration!</p>
              </div>
            </div>

            {/* Event Time: Updated to 1:00 PM */}
            <div className="flex items-start space-x-3.5 bg-pink-50/90 p-3.5 rounded-2xl border border-pink-200">
              <div className="bg-pink-400 p-3 rounded-2xl text-white shadow border-2 border-white shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Time</h4>
                <p className="text-base sm:text-lg font-black text-slate-900">Starts at 1:00 PM, ends at 2:30 PM</p>
                <p className="text-xs font-semibold text-pink-700">Lunch & Afternoon Celebration</p>
              </div>
            </div>

            {/* Venue Location */}
            <div className="sm:col-span-2 flex items-start space-x-3.5 bg-emerald-50/90 p-4 rounded-2xl border-2 border-emerald-200">
              <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow border-2 border-white shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Venue Location</h4>
                <p className="text-base sm:text-lg font-black text-slate-900">McDonald's</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Arcovia City
                </p>
                <p className="text-[11px] text-emerald-800 font-bold mt-1">
                  🚗 Free parking available in Arcovia City grounds
                </p>
              </div>
            </div>

          </div>

          {/* Directions CTA Button */}
          <a 
            href="https://maps.google.com/?q=McDonald's+Arcovia+City+Pasig" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition transform hover:scale-[1.01] active:scale-98"
          >
            <Navigation className="w-5 h-5 fill-current" />
            <span>Open in Google Maps / Waze Directions</span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
          </a>
        </div>

        {/* RSVP Section */}
        <div id="rsvp" className="max-w-2xl mx-auto bg-white/98 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-sky-400 text-left mb-8">
          <div className="text-center mb-6">
            <span className="bg-sky-100 text-sky-800 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border border-sky-300">
              RSVP Confirmation
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Will You Attend?</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Please RSVP by October 24 so we can finalize party meals, seats, and loot bags! 🎁
            </p>
          </div>

          {rsvpSubmitted ? (
            <div className="bg-emerald-50 border-3 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center animate-fade-in shadow-inner">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-white">
                <PartyPopper className="w-8 h-8" />
              </div>
              <div className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-300">
                RSVP Confirmation Received
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-emerald-900 mb-2">
                Thank You, {submittedGuestInfo?.name || guestName || 'Friend'}! 🎉
              </h4>
              <p className="text-emerald-800 font-bold text-base sm:text-lg mb-4 leading-relaxed">
                {(submittedGuestInfo?.attendance || attendance) === 'yes' 
                  ? `Thank you so much for your RSVP confirmation! We are overjoyed and can't wait to celebrate baby Zaire's 1st Birthday with you${(submittedGuestInfo?.count || guestCount) > 1 ? ` and your party of ${submittedGuestInfo?.count || guestCount}` : ''} on Saturday, October 31, 2026 at 1:00 PM at McDonald's Arcovia City! 🍉🎂` 
                  : `Thank you for letting us know! Even though you can't be there in person, we are truly grateful for your warm birthday wishes and love for baby Zaire! ❤️`}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                  onClick={() => {
                    setRsvpSubmitted(false);
                    setSubmittedGuestInfo(null);
                    setGuestName('');
                    setMessage('');
                  }}
                  className="bg-white border-2 border-emerald-400 text-emerald-800 font-black text-xs px-4 py-2.5 rounded-full uppercase tracking-wider hover:bg-emerald-100 transition shadow cursor-pointer"
                >
                  Submit Another Guest Response
                </button>
                <button 
                  onClick={fireConfetti}
                  className="bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-full uppercase tracking-wider hover:bg-emerald-700 transition shadow cursor-pointer"
                >
                  🎉 Pop More Confetti!
                </button>
              </div>
            </div>
          ) : (
            <form 
              onSubmit={handleRsvpSubmit} 
              action="https://formspree.io/f/xgaoqlyl" 
              method="POST" 
              className="space-y-4"
            >
              {/* Full Name input with name="fullName" */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1.5 flex items-center space-x-1">
                  <Smile className="w-4 h-4 text-emerald-600" />
                  <span>Your Full Name / Family Name *</span>
                </label>
                <input 
                  type="text" 
                  name="fullName"
                  id="fullName"
                  required
                  placeholder="Enter your full name or family name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl px-4 py-3.5 text-slate-800 font-bold outline-none transition shadow-sm"
                />
              </div>

              {/* Attending Status input with name="attendingStatus" */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">Will you attend? *</label>
                <input 
                  type="hidden" 
                  name="attendingStatus" 
                  value={attendance === 'yes' ? 'Joyfully Accepts' : 'Regretfully Declines'} 
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendance('yes')}
                    className={`py-3.5 px-4 rounded-2xl font-black flex items-center justify-center space-x-2 border-2 transition cursor-pointer ${
                      attendance === 'yes' 
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-sm sm:text-base">Joyfully Accepts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendance('no')}
                    className={`py-3.5 px-4 rounded-2xl font-black flex items-center justify-center space-x-2 border-2 transition cursor-pointer ${
                      attendance === 'no' 
                        ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-300' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm sm:text-base">Regretfully Declines</span>
                  </button>
                </div>
              </div>

              {/* Guest Count input with name="guestCount" */}
              {attendance === 'yes' ? (
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1.5 flex items-center space-x-1">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>Number of Guests Attending</span>
                  </label>
                  <select 
                    name="guestCount"
                    id="guestCount"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-slate-800 font-bold outline-none transition shadow-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest (Self)' : `Guests (Party of ${num})`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input type="hidden" name="guestCount" value={0} />
              )}

              {/* Birthday Wish input with name="birthdayWish" */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1.5 flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4 text-pink-600" />
                  <span>Birthday Wish for Baby Zaire</span>
                </label>
                <textarea 
                  name="birthdayWish"
                  id="birthdayWish"
                  rows={3}
                  placeholder="Leave a sweet 1st birthday message or prayer for Zaire..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl px-4 py-3 text-slate-800 font-medium outline-none transition resize-none shadow-sm"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmittingRsvp}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-75 disabled:cursor-wait text-white font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center space-x-2 transform active:scale-95 transition cursor-pointer"
              >
                {isSubmittingRsvp ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-base sm:text-lg">Sending Your RSVP...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="text-base sm:text-lg">Submit RSVP Confirmation</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Gift Ideas Section */}
        <div className="max-w-2xl mx-auto bg-white/98 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-400 text-left mb-8">
          <div className="text-center mb-6">
            <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border border-yellow-300">
              Gift Guide
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Allowed Gifts for Zaire</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Your presence and blessings are our biggest gift! If you wish to send a present, <span className="rainbow-text-bold px-1.5 py-0.5 inline-block font-black text-sm"></span>here are Zaire's favorites:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Gift 1: Baby Essentials */}
            <div className="bg-yellow-50/90 border-2 border-yellow-200 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm hover:bg-yellow-100 transition">
              <div className="bg-yellow-400 p-3 rounded-2xl text-slate-900 shadow border-2 border-white shrink-0">
                <Baby className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-800">Baby Essentials 🍼</h4>
                <p className="text-xs font-medium text-slate-600">Diapers, wipes, baby toiletries & care items</p>
              </div>
            </div>

            {/* Gift 2: Baby Clothes */}
            <div className="bg-pink-50/90 border-2 border-pink-200 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm hover:bg-pink-100 transition">
              <div className="bg-pink-400 p-3 rounded-2xl text-white shadow border-2 border-white shrink-0">
                <Shirt className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-800">Baby Clothes 👶👕</h4>
                <p className="text-xs font-medium text-slate-600">Outfits size 12–18 months</p>
              </div>
            </div>

            {/* Gift 3: Monetary Gifts */}
            <div className="bg-emerald-50/90 border-2 border-emerald-200 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm hover:bg-emerald-100 transition">
              <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow border-2 border-white shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-800">Monetary Gifts 💵</h4>
                <p className="text-xs font-medium text-slate-600">For Zaire's savings & future education fund</p>
              </div>
            </div>

            {/* Gift 4: Educational Toys & Books */}
            <div className="bg-sky-50/90 border-2 border-sky-200 rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm hover:bg-sky-100 transition">
              <div className="bg-sky-500 p-3 rounded-2xl text-white shadow border-2 border-white shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-800">Educational Toys & Books 📚🧸</h4>
                <p className="text-xs font-medium text-slate-600">Board books, sensory & learning toys</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wishes & Messages Wall (Live Real-Time Guestbook) */}
        <div className="max-w-2xl mx-auto bg-white/98 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-rose-300 text-left mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-rose-100 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-rose-100 text-rose-800 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Guestbook
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Updates</span>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Wishes for Baby Zaire 💌
              </h3>
            </div>
            <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {wishes.length} {wishes.length === 1 ? 'Message' : 'Messages'}
            </span>
          </div>

          {isLoadingWishes ? (
            <div className="text-center py-8 text-slate-400 font-bold text-sm">
              Loading wishes...
            </div>
          ) : wishes.length === 0 ? (
            <div className="text-center py-10 px-4 bg-rose-50/60 rounded-2xl border-2 border-dashed border-rose-200">
              <span className="text-4xl block mb-2">💌</span>
              <p className="text-slate-800 font-black text-base sm:text-lg">No birthday wishes yet!</p>
              <p className="text-slate-600 font-semibold text-xs sm:text-sm mt-1">
                Be the first to leave a message.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {wishes.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 transition hover:bg-rose-50/50 shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-xs sm:text-sm text-slate-800">{item.name}</span>
                      {item.attendance === 'yes' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                          Attending ({item.guests})
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                          Sending Love
                        </span>
                      )}
                    </div>
                    {/* Real-time relative timestamp ("Just now", "1 min ago", "5 mins ago", "2 hours ago") */}
                    <span 
                      className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80 flex items-center gap-1 shadow-2xs shrink-0"
                      title={item.timestamp ? new Date(item.timestamp).toLocaleString() : (item.createdAt ? new Date(item.createdAt).toLocaleString() : item.time)}
                    >
                      <Clock className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{formatRelativeTime(item.timestamp || item.createdAt, item.time)}</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium italic">
                    "{item.message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with 1:00 PM time */}
        <footer className="text-center text-slate-900 text-xs sm:text-sm py-4 font-black drop-shadow-sm">
          <p className="text-slate-900 text-base font-extrabold bg-white/90 backdrop-blur-xs py-1.5 px-4 rounded-full inline-block shadow">
            We can't wait to see you at Zaire's 1st Birthday Party! 🍉🎈
          </p>
          <p className="mt-2 text-slate-800 font-bold bg-white/80 py-1 px-4 rounded-full inline-block shadow-sm">
            Saturday, October 31, 2026 @ 1:00 PM • McDonald's Arcovia City, Pasig
          </p>
          <div className="mt-3 text-[11px] text-slate-800 font-bold flex items-center justify-center space-x-1">
            <span>Made with love for Zaire</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
          </div>
        </footer>

      </main>
    </div>
  );
}
