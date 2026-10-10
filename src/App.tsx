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
  time: string;
}

export default function App() {
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [attendance, setAttendance] = useState<'yes' | 'no'>('yes');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [photoSrc, setPhotoSrc] = useState<string>('/zaire_nobg.jpg');
  const [copiedLink, setCopiedLink] = useState(false);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(true);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicStopTimerRef = useRef<number | null>(null);

  // Load locked photo & live wishes
  useEffect(() => {
    // 1. Check if user already loaded their son's photo in localStorage
    try {
      const savedPhoto = localStorage.getItem('zaire_birthday_custom_photo');
      if (savedPhoto && savedPhoto.startsWith('data:image')) {
        setPhotoSrc(savedPhoto);
        // Automatically sync to server so all visitors across all devices see baby Zaire's photo
        fetch('/api/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: savedPhoto })
        }).catch((err) => console.warn('Photo sync error:', err));
      } else {
        // Fetch from server if not in this browser's localStorage
        fetch('/api/photo')
          .then((res) => res.json())
          .then((data) => {
            if (data && data.photo) {
              setPhotoSrc(data.photo);
              localStorage.setItem('zaire_birthday_custom_photo', data.photo);
            }
          })
          .catch((err) => console.warn('Could not fetch server photo:', err));
      }
    } catch (e) {
      console.warn('Photo initialization error:', e);
    }

    // 2. Clean out old dummy test messages from user's browser localStorage if present
    try {
      const stored = localStorage.getItem('zaire_birthday_wishes');
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = Array.isArray(parsed) 
          ? parsed.filter((w: WishItem) => w.id !== '1' && w.id !== '2')
          : [];
        setWishes(filtered);
        localStorage.setItem('zaire_birthday_wishes', JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn(e);
    }

    // 3. Fetch real live wishes from server endpoint
    fetch('/api/wishes')
      .then((res) => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then((data: WishItem[]) => {
        if (Array.isArray(data)) {
          const realWishes = data.filter((w) => w.id !== '1' && w.id !== '2');
          setWishes(realWishes);
          localStorage.setItem('zaire_birthday_wishes', JSON.stringify(realWishes));
        }
      })
      .catch((err) => {
        console.warn('Backend wishes fetch fallback to local:', err);
      })
      .finally(() => {
        setIsLoadingWishes(false);
      });
  }, []);

  // Countdown timer to October 31, 2026, 3:00 PM (15:00)
  useEffect(() => {
    const eventDate = new Date('2026-10-31T15:00:00+08:00').getTime();

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

  // Confetti celebration launcher
  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#ec4899', '#a855f7']
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#facc15', '#10b981', '#38bdf8']
        });
        confetti({
          particleCount: 50,
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

  // Synthesized music with Web Audio API
  const toggleMusic = () => {
    if (isPlayingMusic) {
      if (musicStopTimerRef.current) {
        window.clearTimeout(musicStopTimerRef.current);
        musicStopTimerRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsPlayingMusic(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

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
          gain.gain.exponentialRampToValueAtTime(0.18, time + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, time + durations[idx]);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(time);
          osc.stop(time + durations[idx]);
          time += durations[idx];
          totalDuration += durations[idx];
        });

        setIsPlayingMusic(true);

        musicStopTimerRef.current = window.setTimeout(() => {
          setIsPlayingMusic(false);
          if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
          }
        }, (totalDuration + 0.5) * 1000);

      } catch (err) {
        console.warn('Audio Context restricted or not supported.', err);
      }
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const payload = {
      name: guestName.trim(),
      attendance,
      guests: attendance === 'yes' ? guestCount : 0,
      message: message.trim() || (attendance === 'yes' ? "Can't wait to celebrate with Zaire! 🎉" : "Best wishes to baby Zaire! ❤️")
    };

    const localNewWish: WishItem = {
      id: Date.now().toString(),
      name: payload.name,
      attendance: payload.attendance,
      guests: payload.guests,
      message: payload.message,
      time: 'Just now'
    };

    const updatedWishes = [localNewWish, ...wishes];
    setWishes(updatedWishes);
    try {
      localStorage.setItem('zaire_birthday_wishes', JSON.stringify(updatedWishes));
    } catch (err) {
      console.warn(err);
    }

    setRsvpSubmitted(true);
    fireConfetti();

    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const savedServerWish: WishItem = await response.json();
        setWishes((prev) => [savedServerWish, ...prev.filter((w) => w.id !== localNewWish.id)]);
      }
    } catch (err) {
      console.warn('Saved locally, server sync failed:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Zaire's 1st Birthday Invitation 🍉",
      text: "You're invited to celebrate Zaire's 1st Birthday CoComelon party on Saturday, October 31, 2026 at McDonald's Arcovia City, Pasig!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Zaire's 1st Birthday Party 🍉")}&dates=20261031T070000Z/20261031T110000Z&details=${encodeURIComponent("Join us in celebrating baby Zaire's 1st Birthday! Theme: CoComelon. Venue: McDonald's Arcovia City, Pasig.")}&location=${encodeURIComponent("McDonald's, Block 7 Lot 2, Arcovia City, Pasig, 1604 Metro Manila")}`;

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
DTSTART:20261031T070000Z
DTEND:20261031T110000Z
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
    <div className="min-h-screen text-slate-800 font-sans relative overflow-x-hidden pb-16 bg-sky-200">
      
      {/* ============================================================ */}
      {/* ULTRA-CRISP, VIVID COCOMELON SCENERY BACKGROUND */}
      {/* Featuring Rainbow, Sky, Clouds, Yellow Bus, JJ & Teddy, YoYo */}
      {/* ============================================================ */}
      
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center md:bg-top bg-no-repeat opacity-95 filter contrast-105 saturate-115 brightness-102"
        style={{ 
          backgroundImage: `url('/cocomelon_vivid_landscape.jpg')`
        }}
      />

      {/* Gentle localized backlight wash to ensure high contrast & pristine card legibility */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial from-white/30 via-transparent to-black/10" />

      {/* Navigation Header */}
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

        <div className="flex items-center space-x-2">
          {/* Audio toggle button */}
          <button 
            onClick={toggleMusic}
            aria-label="Toggle party tune"
            className={`px-3 py-2 rounded-full font-black text-xs transition border-2 flex items-center space-x-1.5 shadow ${
              isPlayingMusic 
                ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse' 
                : 'bg-yellow-300 text-slate-900 border-yellow-400 hover:bg-yellow-400'
            }`}
          >
            {isPlayingMusic ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlayingMusic ? 'Playing Song 🎶' : 'Play Song 🎵'}</span>
          </button>

          {/* Confetti button */}
          <button 
            onClick={fireConfetti}
            className="bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black px-3.5 py-2 rounded-full text-xs shadow-md hover:scale-105 active:scale-95 transition flex items-center space-x-1.5 border-2 border-white cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Confetti!</span>
            <span className="sm:hidden">Pop!</span>
          </button>

          {/* Share button */}
          <button 
            onClick={handleShare}
            className="bg-sky-500 hover:bg-sky-600 text-white font-black px-3 py-2 rounded-full text-xs shadow-md hover:scale-105 active:scale-95 transition flex items-center space-x-1 border-2 border-white cursor-pointer"
            title="Share invitation link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copiedLink ? 'Copied Link!' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6 text-center relative z-10">
        
        {/* Banner Tag */}
        <div className="inline-flex items-center space-x-2 bg-yellow-400 text-slate-900 px-5 py-2 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider mb-4 shadow-xl border-2 border-white">
          <span className="text-base">🍉</span>
          <span>You're Invited to Zaire's 1st Birthday!</span>
          <span className="text-base">🍉</span>
        </div>

        {/* Headline Titles */}
        <h1 className="text-4xl sm:text-6xl font-black text-emerald-900 drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)] mb-1 leading-tight tracking-tight">
          Join Us and Celebrate
        </h1>
        <h2 className="text-3xl sm:text-5xl font-black text-rose-500 drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)] mb-6">
          Zaire's 1st Birthday! 🎂
        </h2>

        {/* ============================================================ */}
        {/* HERO SECTION: LOCKED PERMANENT PHOTO OF BABY ZAIRE */}
        {/* Protected, read-only spotlight frame with nobody able to edit */}
        {/* ============================================================ */}
        <div className="flex flex-col items-center justify-center mb-8">
          
          {/* Circular Frame - Protected & Non-Editable */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-92 md:h-92 mx-auto select-none pointer-events-none">
            
            {/* Rainbow Glowing Outer Ring */}
            <div className="absolute -inset-4 sm:-inset-5 bg-gradient-to-r from-red-500 via-yellow-400 via-emerald-400 via-sky-400 to-pink-500 rounded-full animate-spin-slow opacity-95 blur-xs shadow-2xl"></div>
            
            {/* Photo Container - Locked and Display Only */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-8 border-white shadow-2xl bg-gradient-to-b from-yellow-200 to-sky-200 flex items-center justify-center pointer-events-none">
              <img 
                src="./1211e183-0b4f-4164-b459-96c206205c6d.jpg" 
                alt="Birthday Boy Zaire" 
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{
                  transform: 'scale(1.00)',
                  transformOrigin: 'center 35%'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/1211e183-0b4f-4164-b459-96c206205c6d.jpg";
                }}
              />
            </div>

            {/* Festive Party Hat Emoji */}
            <div className="absolute -top-7 -right-1 sm:-top-8 sm:-right-2 text-6xl sm:text-7xl transform roDtate-12 drop-shadow-xl pointer-events-none">
              🥳
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
            Zaire is turning 1! Join the fun with JJ & friends! 🎈
          </p>

          {/* Quick Calendar & Share Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-emerald-50 text-emerald-700 font-black text-xs px-4 py-2 rounded-xl shadow-lg border-2 border-emerald-400 transition transform hover:scale-105"
            >
              <CalendarPlus className="w-4 h-4 text-emerald-600" />
              <span>Add to Google Calendar</span>
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

        {/* Countdown Timer */}
        <div className="max-w-xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border-4 border-emerald-400 mb-8">
          <p className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" /> 
            <span>Countdown to Party Time</span>
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

        {/* Event Details Card */}
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

            {/* Event Time */}
            <div className="flex items-start space-x-3.5 bg-pink-50/90 p-3.5 rounded-2xl border border-pink-200">
              <div className="bg-pink-400 p-3 rounded-2xl text-white shadow border-2 border-white shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Time</h4>
                <p className="text-base sm:text-lg font-black text-slate-900">Starts at 3:00 PM</p>
                <p className="text-xs font-semibold text-pink-700">Afternoon Games & Merienda</p>
              </div>
            </div>

            {/* Venue Location */}
            <div className="sm:col-span-2 flex items-start space-x-3.5 bg-emerald-50/90 p-4 rounded-2xl border-2 border-emerald-200">
              <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow border-2 border-white shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Venue Location</h4>
                <p className="text-base sm:text-lg font-black text-slate-900">McDonald's, Block 7 Lot 2</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Arcovia City, Pasig, 1604 Metro Manila
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
              Please RSVP by October 20 so we can finalize party meals, seats, and loot bags! 🎁
            </p>
          </div>

          {rsvpSubmitted ? (
            <div className="bg-emerald-50 border-3 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center animate-fade-in shadow-inner">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-white">
                <PartyPopper className="w-8 h-8" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-emerald-900 mb-2">Response Confirmed! 🎉</h4>
              <p className="text-emerald-800 font-bold text-base sm:text-lg mb-4 leading-relaxed">
                {attendance === 'yes' 
                  ? `Hooray, ${guestName}! We can't wait to celebrate with you and your ${guestCount} guest(s) on October 31 at McDonald's Arcovia City!` 
                  : `Thank you for letting us know, ${guestName}. We'll miss you at Zaire's 1st Birthday!`}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                  onClick={() => {
                    setRsvpSubmitted(false);
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
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1.5 flex items-center space-x-1">
                  <Smile className="w-4 h-4 text-emerald-600" />
                  <span>Your Full Name / Family Name *</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Auntie Maria & Tito Juan"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl px-4 py-3.5 text-slate-800 font-bold outline-none transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">Will you attend? *</label>
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

              {attendance === 'yes' && (
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1.5 flex items-center space-x-1">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>Number of Guests Attending</span>
                  </label>
                  <select 
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
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1.5 flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4 text-pink-600" />
                  <span>Birthday Wish for Baby Zaire</span>
                </label>
                <textarea 
                  rows={3}
                  placeholder="Leave a sweet 1st birthday message or prayer for Zaire..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl px-4 py-3 text-slate-800 font-medium outline-none transition resize-none shadow-sm"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center space-x-2 transform active:scale-95 transition cursor-pointer"
              >
                <Send className="w-5 h-5" />
                <span className="text-base sm:text-lg">Submit RSVP Confirmation</span>
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
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Your presence and blessings are our biggest gift! If you wish to send a present, here are Zaire's favorites:
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

        {/* Wishes & Messages Wall (Live Guestbook) */}
        <div className="max-w-2xl mx-auto bg-white/98 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-rose-300 text-left mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-rose-100 pb-3">
            <div>
              <span className="bg-rose-100 text-rose-800 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Guestbook
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Wishes for Baby Zaire 💌
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {wishes.length} {wishes.length === 1 ? 'Message' : 'Messages'}
            </span>
          </div>

          {isLoadingWishes ? (
            <div className="text-center py-8 text-slate-400 font-bold text-sm">
              Loading wishes...
            </div>
          ) : wishes.length === 0 ? (
            <div className="text-center py-8 px-4 bg-rose-50/50 rounded-2xl border border-rose-100">
              <span className="text-3xl block mb-2">💌</span>
              <p className="text-slate-800 font-black text-sm sm:text-base">No messages yet!</p>
              <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
                Be the first invited guest to leave a sweet 1st birthday wish for baby Zaire above! 🎈
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {wishes.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 transition hover:bg-rose-50/50"
                >
                  <div className="flex items-center justify-between mb-1">
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
                    <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium italic">
                    "{item.message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-900 text-xs sm:text-sm py-4 font-black drop-shadow-sm">
          <p className="text-slate-900 text-base font-extrabold bg-white/90 backdrop-blur-xs py-1.5 px-4 rounded-full inline-block shadow">
            We can't wait to see you at Zaire's 1st Birthday Party! 🍉🎈
          </p>
          <p className="mt-2 text-slate-800 font-bold bg-white/80 py-1 px-4 rounded-full inline-block shadow-sm">
            Saturday, October 31, 2026 @ 3:00 PM • McDonald's Arcovia City, Pasig
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
