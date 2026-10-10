'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './WeddingJourneyInvitation.module.css';

interface WeddingJourneyProps {
  groomName?: string;
  brideName?: string;
  guestName?: string;
  tagline?: string;
  weddingDateISO?: string;
  weddingDateLabel?: string;
  openingMessage?: string;
  story?: Array<{ year: string; title: string; text: string }>;
  events?: any;
  gifts?: any;
  musicUrl?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapsUrl?: string;
  onRsvpSubmit?: (data: any) => Promise<any> | void;
}

interface Checkpoint {
  id: string;
  xPos: number;
  title: string;
  npcLabel: string;
  npcImage: string;
}

const WORLD_WIDTH = 2950;

interface Checkpoint {
  id: string;
  xPos: number;
  title: string;
  npcLabel: string;
  npcImage: string;
  className?: string; // Properti opsional untuk penyesuaian ukuran unik
}

const CHECKPOINTS: Checkpoint[] = [
  { id: 'welcome', xPos: 350, title: 'Selamat Datang', npcLabel: 'Information', npcImage: '/assets/Message.png', className: styles.checkpoint_welcome },
  { id: 'location', xPos: 850, title: 'Waktu & Lokasi', npcLabel: 'Venue', npcImage: '/assets/Groom-Bride-info.png', className: styles.checkpoint_location },
  { id: 'thanks', xPos: 1350, title: 'Terima Kasih', npcLabel: 'Pesan Spesial', npcImage: '/assets/mempelai.png', className: styles.checkpoint_thanks },
  { id: 'rsvp', xPos: 1850, title: 'Konfirmasi Kehadiran', npcLabel: 'RSVP', npcImage: '/assets/npc-rsvp.png', className: styles.checkpoint_rsvp },
  { id: 'gift', xPos: 2250, title: 'Kado Digital & QRIS', npcLabel: 'Wedding Gift', npcImage: '/assets/Gift.png', className: styles.checkpoint_gift },
  { id: 'venue', xPos: 2750, title: 'Lokasi Acara', npcLabel: 'Tempat Acara', npcImage: '/assets/clocktower.png', className: styles.checkpoint_venue },
];
export default function WeddingJourneyInvitation({
  groomName = 'Dinar',
  brideName = 'Elrisa',
  guestName = 'Jojo & Jeje',
  tagline = 'THE WEDDING OF',
  weddingDateLabel = '22 . 11 . 2026',
  venueName = 'Gedung Balairakyat Depok I / Gedung Serbaguna',
  venueAddress = 'Jl. Bangau Raya No.192-174, Depok Jaya, Pancoran Mas, Depok City, West Java 16432',
  venueMapsUrl = 'https://www.google.com/maps/place/Gedung+Serbaguna+Depok+Jaya/@-6.3907592,106.809646,17z/data=...',
  onRsvpSubmit,
}: WeddingJourneyProps) {
  const [gameState, setGameState] = useState<'cover' | 'gender' | 'playing'>('cover');
  const [gender, setGender] = useState<'man' | 'woman'>('man');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const [playerX, setPlayerX] = useState(100);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
const [dismissedCheckpoint, setDismissedCheckpoint] = useState<string | null>(null);
  const walkingStateRef = useRef({ left: false, right: false });

  // Game Loop
// Game Loop
  useEffect(() => {
    // Jika modal sedang terbuka, hentikan status jalan dan reset input tombol
    if (activeModal) {
      walkingStateRef.current = { left: false, right: false };
      setIsWalking(false);
      return;
    }

    if (gameState !== 'playing') return;

    let animationFrameId: number;
    const gameLoop = () => {
      const { left, right } = walkingStateRef.current;
      const speed = 3.5;

      if (left && !right) {
        setPlayerX((prev) => Math.max(60, prev - speed));
        setDirection('left');
        setIsWalking(true);
      } else if (right && !left) {
        setPlayerX((prev) => Math.min(WORLD_WIDTH - 120, prev + speed));
        setDirection('right');
        setIsWalking(true);
      } else {
        setIsWalking(false);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, activeModal]);


// Auto-trigger modal saat mendekat & reset saat menjauh
useEffect(() => {
  // Sensor jarak yang sama dengan nearbyCheckpoint
  const currentCheckpoint = CHECKPOINTS.find((cp) => Math.abs(cp.xPos - playerX) < 40);

  if (currentCheckpoint) {
    // Buka otomatis jika pos belum ditutup oleh tamu
    if (dismissedCheckpoint !== currentCheckpoint.id) {
      setActiveModal(currentCheckpoint.id);
    }
  } else {
    // Jika tamu berjalan menjauh, reset penanda
    setActiveModal(null);
    setDismissedCheckpoint(null);
  }
}, [playerX, dismissedCheckpoint]);


  // Key Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || activeModal) return;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') walkingStateRef.current.right = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') walkingStateRef.current.left = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') walkingStateRef.current.right = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') walkingStateRef.current.left = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, activeModal]);

  const [isLoading, setIsLoading] = useState(true);
const [loadProgress, setLoadProgress] = useState(0);

  const nearbyCheckpoint = CHECKPOINTS.find((cp) => Math.abs(cp.xPos - playerX) < 95);
  const cameraX = Math.max(0, Math.min(WORLD_WIDTH - 420, playerX - 210));

// List semua file gambar yang wajib ter-load sebelum aplikasi terbuka
  const ASSETS_TO_LOAD = [
    '/assets/Background.png',
    '/assets/backgroundchosecaharacter.png',
    '/assets/background3.png',
    '/assets/man-walk2.png',
    '/assets/woman-walk.png',
    '/assets/Flower.png',
    '/assets/NewGroomBrideCharacter.png',
    '/assets/cat.png',
    '/assets/Open Invitation Background.png',
  ];

  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_LOAD.length;

    ASSETS_TO_LOAD.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount += 1;
        setLoadProgress(Math.round((loadedCount / totalAssets) * 100));
        if (loadedCount === totalAssets) {
          // Kasih jeda sedikit (400ms) agar transisi terasa mulus
          setTimeout(() => setIsLoading(false), 400);
        }
      };
      img.onerror = () => {
        // Tetap hitung walau ada yang gagal agar tidak terjebak stuck loading
        loadedCount += 1;
        setLoadProgress(Math.round((loadedCount / totalAssets) * 100));
        if (loadedCount === totalAssets) {
          setTimeout(() => setIsLoading(false), 400);
        }
      };
    });
  }, []);


  return (
    <div className={styles.wrapper}>

{/* Layar Loading Interaktif */}
      {isLoading && (
        <div className={styles.loadingScreen}>
          <h2 className={styles.loadingTitle}>{brideName} & {groomName}</h2>
          <div className={styles.progressBarContainer}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${loadProgress}%` }} 
            />
          </div>
          <p className={styles.loadingText}>LOADING INVITATION... {loadProgress}%</p>
        </div>
      )}

      {/* 1. COVER SCREEN */}
      {gameState === 'cover' && (
        <div className={styles.cover}>
          
          {/* Layer Ornamen Bunga Melayang (Flower.png) */}
          <img src="/assets/Flower.png" alt="" className={styles.flowerOverlay} />

          
          <img src="/assets/bird.png" alt="" className={styles.bird} />

          {/* Kontainer Utama Teks */}
          <div className={styles.coverContent}>
            
            {/* Header: Tagline, Nama Mempelai, Tanggal */}
            <div className={styles.headerGroup}><br></br>
              <p className={styles.taglineText}>THE WEDDING OF</p><br></br>
              <div className={styles.coupleNamesContainer}>
                    <span className={styles.groomName}>{brideName}</span>
                    <span className={styles.ampersand}>&</span>
                    <span className={styles.brideName}>{groomName}</span>
              </div><br></br>
              <p className={styles.dateText}>{weddingDateLabel}</p>
            </div>
<br></br><br></br>
            {/* Ayat QS. Ar-Rum: 21 */}
            {/* <div className={styles.verseGroup}>
              <p className={styles.verseBody}>
                "And among the signs of His power is that He created for you wives of your own kind,<br/>
                so that you would be inclined and feel at ease with them,<br/>
                and He made among you a feeling of love and affection.<br/>
                Indeed, in that there are truly signs for a person who thinks<br/>
                (لِقَوْمٍ يَتَفَكَّرُونَ )."
              </p>
              <p className={styles.verseRef}>(QS. Ar-Rum: 21)</p>
            </div> */}

            {/* Sapaan Tamu */}
            {guestName && (
              <div className={styles.guestGroup}>
                <p className={styles.guestLabel}>To the dearest,</p>
                <p className={styles.guestName}>{guestName}</p>
              </div>
            )}

          </div>

          {/* Ilustrasi Pengantin 3D + Kucing */}
          <img src="/assets/NewGroomBrideCharacter.png" alt="Couple Character" className={styles.characterImg} />

          {/* Bingkai Tombol Emas Overlay & Tombol Klik */}
{/* Tombol Open Invitation */}
<img src="/assets/cat.png" alt="Cute Cat" className={styles.catCoverImg} />
<button
  className={styles.openBtnHitbox}
  onClick={() => {
    setGameState('gender');
    // Memutar musik otomatis saat tombol diklik
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Gagal memutar audio:', err));
    }
  }}
>
  <span>Open Invitation</span>
</button>

        </div>
      )}

      {/* 2. CHOOSE CHARACTER */}
      {/* 2. CHOOSE CHARACTER */}
      {gameState === 'gender' && (
        <div className={styles.genderScreen}>
          
          {/* Header Bingkai Emas Nama Mempelai */}
          <div className={styles.characterHeaderContainer}>
            <p className={styles.charTagline}>THE WEDDING OF</p>
            
            <div className={styles.charNamesGroup}>
              <span className={styles.charGroom}>{brideName}</span>
              <span className={styles.charAmpersand}>&</span>
              <span className={styles.charBride}>{groomName}</span>
            </div>

            <p className={styles.charDate}>{weddingDateLabel}</p>
          </div>

          {/* Teks Instruksi */}
          <div className={styles.instructionTextGroup}>
            <p className={styles.instructionLine1}>Choose your character</p>
            <p className={styles.instructionLine2}>⬇️&emsp;&emsp;&emsp;or&emsp;&emsp;&emsp;⬇️</p>
            

          </div>

          {/* Area Pilihan Karakter (Man & Woman) */}
          <div className={styles.characterSelectionRow}>
            
            {/* Karakter Pria */}
            <div 
              className={styles.characterBox} 
              onClick={() => { setGender('man'); setGameState('playing'); }}
            >
              <img 
                src="/assets/man characters.png" 
                alt="Man Character" 
                className={styles.characterPortrait} 
              />
              <button className={styles.manSelectButton}>
                <span>Man</span>
              </button>
            </div>

            {/* Karakter Wanita */}
            <div 
              className={styles.characterBox} 
              onClick={() => { setGender('woman'); setGameState('playing'); }}
            >
              <img 
                src="/assets/woman characters.png" 
                alt="Woman Character" 
                className={styles.characterPortrait} 
              />
              <button className={styles.womanSelectButton}>
                <span>Woman</span>
              </button>
            </div>

          </div>

        </div>
      )}


      {/* 3. GAMEPLAY */}
      {gameState === 'playing' && (
        <div className={styles.gameStage}>
          {/* Header Overlay */}
          <div className={styles.headerInfoOverlay}>
            <p className={styles.tagline}>{tagline}</p>
            <h2 className={styles.gameTitle}> {brideName}<span className={styles.heart}>♥</span>{groomName} </h2>
            <p className={styles.dateText}>{weddingDateLabel}</p>
          </div>

          {/* Interactive Pill
          {nearbyCheckpoint && (
            <div className={styles.interactivePillWrapper}>
              <button className={styles.interactivePill} onClick={() => setActiveModal(nearbyCheckpoint.id)}>
                <span>{nearbyCheckpoint.npcLabel}</span>
              </button>
            </div>
          )} */}

          <div className={styles.viewport}>
            <div
              className={styles.worldTrack}
              style={{ width: `${WORLD_WIDTH}px`, transform: `translateX(-${cameraX}px)` }}
            >
              {CHECKPOINTS.map((cp) => {
                const isVenue = cp.id === 'venue';
                return (
                  <div
                    key={cp.id}
                    className={isVenue ? styles.venueWorldContainer : styles.npcWorldContainer}
                    style={{ left: `${cp.xPos}px` }}
                  >
                   <img src={cp.npcImage} alt={cp.title} className={`${isVenue ? styles.venueImg : styles.npcImg} ${cp.className || ''}`}/>
                  </div>
                );
              })}

              <div
                className={styles.playerWorldContainer}
                style={{
                  left: `${playerX}px`,
                  transform: `translateX(-50%) ${direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'}`,
                }}
              >
                <div
                  className={`${styles.spriteFrame} ${
                    gender === 'woman' ? styles.womanSprite : styles.manSprite
                  } ${isWalking ? styles.animateWalk : ''}`}
                />
              </div>

              <div className={styles.groundBar} style={{ width: `${WORLD_WIDTH}px` }} />
            </div>
          </div>

          <div className={styles.controlsBar}>
            <button
  className={styles.arrowBtn}
  onMouseDown={() => (walkingStateRef.current.left = true)}
  onMouseUp={() => (walkingStateRef.current.left = false)}
  onMouseLeave={() => (walkingStateRef.current.left = false)}
  onTouchStart={() => (walkingStateRef.current.left = true)}
  onTouchEnd={() => (walkingStateRef.current.left = false)}
  onTouchCancel={() => (walkingStateRef.current.left = false)}
>
  ◀
</button>
            <button className={styles.swapGenderBtn} onClick={() => setGender(gender === 'man' ? 'woman' : 'man')}>
              {gender === 'man' ? '♂' : '♀'}
            </button>
<button
  className={styles.arrowBtn}
  onMouseDown={() => (walkingStateRef.current.right = true)}
  onMouseUp={() => (walkingStateRef.current.right = false)}
  onMouseLeave={() => (walkingStateRef.current.right = false)}
  onTouchStart={() => (walkingStateRef.current.right = true)}
  onTouchEnd={() => (walkingStateRef.current.right = false)}
  onTouchCancel={() => (walkingStateRef.current.right = false)}
>
  ▶
</button>
          </div>
        </div>
      )}

{/* 4. MODALS */}
      {activeModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} ${
  activeModal === 'welcome' ? styles.modalCard_welcome : 
  activeModal === 'rsvp' ? styles.modalCard_rsvp : 
  activeModal === 'location' ? styles.modalCard_location : 
  activeModal === 'venue' ? styles.modalCard_venue : 
  activeModal === 'gift' ? styles.modalCard_gift : 
  activeModal === 'thanks' ? styles.modalCard_thanks : ''
}`}>
            <button 
              className={styles.closeBtn} 
              onClick={() => {
                if (nearbyCheckpoint) setDismissedCheckpoint(nearbyCheckpoint.id);
                setActiveModal(null);
              }}
            >
              ✕
            </button>

            {/* 1. MODAL WELCOME */}
            {activeModal === 'welcome' && (
              <div className={styles.modalBody}>
                <h3>Selamat Datang!</h3>
                <p>Halo <strong>{guestName || 'Tamu Undangan'}</strong>,</p>
                <p>Terima kasih telah bergabung dalam perjalanan bahagia kami. Silakan telusuri peta ini untuk melihat detail acara pernikahan kami.</p>
                <p className={styles.coupleSign}>Dengan kasih,<br /><strong>Elrisa Salsabilla & Dinar Suherlan</strong></p>
              </div>
            )}

            {/* 2. MODAL RSVP */}
            {activeModal === 'rsvp' && (
              <div className={styles.modalBody}>
                <h3>Konfirmasi Kehadiran</h3>
                <p>Silakan konfirmasi kehadiran Anda untuk acara kami:</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Terima kasih! Konfirmasi Anda telah berhasil disimpan.');
                    setActiveModal(null);
                  }}
                  className={styles.formGroup}
                >
                  <input type="text" placeholder="Nama Lengkap" defaultValue={guestName || ''} required />
                  <select required>
                    <option value="">Pilih Kehadiran</option>
                    <option value="1">Hadir (1 Orang)</option>
                    <option value="2">Hadir (2 Orang)</option>
                    <option value="0">Maaf, Tidak Dapat Hadir</option>
                  </select>
                  <button type="submit" className={styles.submitBtn}>Kirim Konfirmasi</button>
                </form>
              </div>
            )}

            {/* 3. MODAL LOCATION */}
            {activeModal === 'location' && (
              <div className={styles.modalBody}>
                <h3>Waktu & Lokasi Acara</h3>
                <div className={styles.scheduleBox}>
                  <div className={styles.scheduleItem}>
                    <h4>Akad Nikah</h4>
                    <p>Minggu, 22 November 2026</p>
                    <p><strong>08.00 - 09.00 WIB</strong></p>
                  </div>
                  <hr className={styles.divider} />
                  <div className={styles.scheduleItem}>
                    <h4>Resepsi Pernikahan</h4>
                    <p>Minggu, 22 November 2026</p>
                    <p><strong>10.00 - 14.30 WIB</strong></p>
                  </div>
                </div>
                <p className={styles.venueTitle}><strong>Balai Rakyat Depok 1</strong></p>
                <button 
                  className={styles.submitBtn} 
                  onClick={() => window.open('https://www.google.com/maps/place/Balai+Rakyat+Depok+1...', '_blank')}
                >
                  📍 Buka Google Maps
                </button>
              </div>
            )}

            {/* 4. MODAL VENUE */}
            {activeModal === 'venue' && (
              <div className={styles.modalBody}>
                <h3>Kamu Telah Tiba!</h3>
                <p>Inilah tempat kami akan merayakan hari bahagia ini bersama.</p>
                <div className={styles.venueCard}>
                  <h4>Balai Rakyat Depok 1</h4>
                  <p>Jl. Bangau Raya No.192-174, Depok Jaya, Pancoran Mas, Depok City, West Java 16432</p>
                </div>
                <button 
                  className={styles.submitBtn} 
                  onClick={() => window.open('https://www.google.com/maps/place/Balai+Rakyat+Depok+1...', '_blank')}
                >
                  📍 Buka Peta
                </button>
              </div>
            )}

            {/* 5. MODAL GIFT */}
            {activeModal === 'gift' && (
              <div className={styles.modalBody}>
                <h3>Wedding Gift</h3>
                <p>Your presence is more than enough, but if you wish to send us a gift, you may do so via:</p>
                <div className={styles.qrisBox}>
                  <p className={styles.bankName}>Bank BCA</p>
                  <p className={styles.accountNumber}><strong>6041336878</strong></p>
                  <p className={styles.accountName}>a.n. Elrisa Salsabilla</p>
                  <button 
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => {
                      navigator.clipboard.writeText('6041336878');
                      alert('Nomor rekening berhasil disalin!');
                    }}
                  >
                    📋 Salin No. Rekening
                  </button>
                </div>
                <p className={styles.giftThanks}>With love and gratitude.</p>
              </div>
            )}

            {/* 6. MODAL THANKS */}
            {activeModal === 'thanks' && (
              <div className={styles.modalBody}>
                <h3>Thank You, Dear Guests!</h3>
                <p>We look forward to celebrating our special day with you. It would be an honor and a joy to have you there to share in our happiness.</p>
                <p className={styles.coupleSign}>With love,<br /><strong>Elrisa Salsabilla & Dinar Suherlan</strong></p>
              </div>
            )}

          </div>
        </div>
      )}
  
      {/* Element Audio MP3 */}
      <audio ref={audioRef} src="/assets/music.mp3" loop />

      {/* Tombol Melayang Kontrol Musik */}
      <button 
        className={styles.musicToggleBtn} 
        onClick={toggleMusic} 
        aria-label="Toggle Music"
      >
        {isPlaying ? '🎵' : '🔇'}
      </button>
    </div>
  );
}