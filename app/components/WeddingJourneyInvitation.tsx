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
  className?: string;
}

interface Decoration {
  id: string;
  xPos: number;
  image: string;
  width?: number;
  bottom?: number;
  zIndex?: number;
}

interface WishItem {
  timestamp: string;
  name: string;
  wish: string;
}

// Lebar total arena permainan
const WORLD_WIDTH = 3400;

// Daftar Pos Checkpoint
const CHECKPOINTS: Checkpoint[] = [
  { id: 'welcome', xPos: 450, title: 'Selamat Datang', npcLabel: 'Information', npcImage: '/assets/Message.png', className: styles.checkpoint_welcome },
  { id: 'location', xPos: 850, title: 'Waktu & Lokasi', npcLabel: 'Venue', npcImage: '/assets/Groom-Bride-info.png', className: styles.checkpoint_location },
  { id: 'thanks', xPos: 1350, title: 'Terima Kasih', npcLabel: 'Pesan Spesial', npcImage: '/assets/mempelai.png', className: styles.checkpoint_thanks },
  { id: 'rsvp', xPos: 1850, title: 'Konfirmasi Kehadiran', npcLabel: 'RSVP', npcImage: '/assets/npc-rsvp.png', className: styles.checkpoint_rsvp },
  { id: 'gift', xPos: 2280, title: 'Kado Digital & QRIS', npcLabel: 'Wedding Gift', npcImage: '/assets/Gift.png', className: styles.checkpoint_gift },
  { id: 'venue', xPos: 3100, title: 'Lokasi Acara', npcLabel: 'Tempat Acara', npcImage: '/assets/Groom & Bride.png', className: styles.checkpoint_venue },
  { id: 'gallery', xPos: 2680, title: 'Galeri Foto', npcLabel: 'Galeri Momen', npcImage: '/assets/Gallery.png', className: styles.checkpoint_gallery },
];

// Daftar Ornamen / Dekorasi Hiasan Jalanan
const DECORATIONS: Decoration[] = [
  { id: 'flower_left', xPos: 120, image: '/assets/pointing.png', width: 240, bottom: 92, zIndex: 15 },
  { id: 'flower_bush', xPos: 2280, image: '/assets/Chair.png', width: 200, bottom: 50, zIndex: 12 },
  { id: 'flower_lamp', xPos: 3100, image: '/assets/rumah.png', width: 600, bottom: 100, zIndex: 11 },
  // { id: 'flower_bush2', xPos: 1600, image: '/assets/bungasudutkiri.png', width: 90, bottom: 40, zIndex: 12 },
  // { id: 'flower_right', xPos: 2100, image: '/assets/bunga.png', width: 85, bottom: 42, zIndex: 8 },
  // { id: 'flower_end', xPos: 2950, image: '/assets/bungasudutkanan.png', width: 95, bottom: 40, zIndex: 12 },
];

export default function WeddingJourneyInvitation({
  groomName = 'Dinar',
  brideName = 'Elrisa',
  guestName = 'Jojo & Jeje',
  tagline = 'THE WEDDING OF',
  weddingDateLabel = '22 . 11 . 2026',
  venueName = 'Gedung Balairakyat Depok I / Gedung Serbaguna',
  venueAddress = 'Jl. Bangau Raya No.192-174, Depok Jaya, Pancoran Mas, Depok City, West Java 16432',
  venueMapsUrl = 'https://www.google.com/maps/place/Gedung+Serbaguna+Depok+Jaya/@-6.3907592,106.809646,17z',
  onRsvpSubmit,
}: WeddingJourneyProps) {
  const [gameState, setGameState] = useState<'cover' | 'gender' | 'playing'>('cover');
  const [gender, setGender] = useState<'man' | 'woman'>('man');

  // Audio Control
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

  // State Preloader Asset
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Player & Game Loop States
  const [playerX, setPlayerX] = useState(100);
  const playerXRef = useRef(100); // Ref posisi pemain untuk mencegah lag pada game loop
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // State untuk menampung daftar doa
  const [wishesList, setWishesList] = useState<WishItem[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);

  useEffect(() => {
    if (activeModal === 'venue') { 
      setIsLoadingWishes(true);
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbxxF6gvQbH_UWhJTYKJuwEdMG0WR5smIHZG-9zCLY1TRhHqCCjvwRgCb4tOP6pMtgdalQ/exec';
      
      fetch(scriptUrl)
        .then(res => res.json())
        .then(data => {
          setWishesList(data);
          setIsLoadingWishes(false);
        })
        .catch(err => {
          console.error('Gagal mengambil doa:', err);
          setIsLoadingWishes(false);
        });
    }
  }, [activeModal]);

  const [dismissedCheckpoint, setDismissedCheckpoint] = useState<string | null>(null);
  const walkingStateRef = useRef({ left: false, right: false });

  // Sinkronisasi playerX dengan playerXRef
  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  // Preload Aset Gambar Utama
  const ASSETS_TO_LOAD = [
    '/assets/Background.png',
    '/assets/backgroundchosecaharacter.png',
    '/assets/background3.png',
    '/assets/man-walk2.png',
    '/assets/woman-walk.png',
    '/assets/Flower.png',
    '/assets/NewGroomBrideCharacter.png',
    '/assets/cat.png',
    '/assets/Gallery.png',
    '/assets/ground.png',
    '/assets/mempelai.png',
    '/assets/rumah.png',
    '/assets/DINAR.jpeg',
    '/assets/EL.jpeg',
    '/assets/1.jpeg',
    '/assets/2.jpeg',
    '/assets/3.jpeg',
    '/assets/11.jpeg',
    '/assets/12.png',
    '/assets/13.jpeg',
    '/assets/14.jpeg',
    '/assets/15.jpeg',
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
          setTimeout(() => setIsLoading(false), 300);
        }
      };
      img.onerror = () => {
        loadedCount += 1;
        setLoadProgress(Math.round((loadedCount / totalAssets) * 100));
        if (loadedCount === totalAssets) {
          setTimeout(() => setIsLoading(false), 300);
        }
      };
    });
  }, []);

  // Optimized Game Loop (Ringan & Tanpa Lag)
  useEffect(() => {
    if (gameState !== 'playing' || activeModal) {
      walkingStateRef.current = { left: false, right: false };
      setIsWalking(false);
      return;
    }

    let animationFrameId: number;
    const speed = 2.5;

    const gameLoop = () => {
      const { left, right } = walkingStateRef.current;
      let currX = playerXRef.current;

      if (left && !right) {
        const newX = Math.max(60, currX - speed);
        setPlayerX(newX);
        setDirection('left');
        setIsWalking(true);
        currX = newX;
      } else if (right && !left) {
        const newX = Math.min(WORLD_WIDTH - 120, currX + speed);
        setPlayerX(newX);
        setDirection('right');
        setIsWalking(true);
        currX = newX;
      } else {
        setIsWalking(false);
      }

      // Sensor Trigger Checkpoint Ringan
      const hitCheckpoint = CHECKPOINTS.find((cp) => Math.abs(cp.xPos - currX) < 45);
      if (hitCheckpoint) {
        if (dismissedCheckpoint !== hitCheckpoint.id) {
          setActiveModal(hitCheckpoint.id);
        }
      } else {
        setDismissedCheckpoint(null);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, activeModal, dismissedCheckpoint]);

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

  const nearbyCheckpoint = CHECKPOINTS.find((cp) => Math.abs(cp.xPos - playerX) < 95);
  const cameraX = Math.max(0, Math.min(WORLD_WIDTH - 420, playerX - 210));

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
          <img src="/assets/Flower.png" alt="" className={styles.flowerOverlay} />
          <img src="/assets/bird.png" alt="" className={styles.bird} />

          <div className={styles.coverContent}>
            <div className={styles.headerGroup}>
              <p className={styles.taglineText}>{tagline}</p>
              <div className={styles.coupleNamesContainer}>
                <span className={styles.groomName}>{brideName}</span>
                <span className={styles.ampersand}>&</span>
                <span className={styles.brideName}>{groomName}</span>
              </div>
              <p className={styles.dateText}>{weddingDateLabel}</p>
            </div>

            {guestName && (
              <div className={styles.guestGroup}>
                <p className={styles.guestLabel}>To the dearest,</p>
                <p className={styles.guestName}>{guestName}</p>
              </div>
            )}
          </div>

          <img src="/assets/NewGroomBrideCharacter.png" alt="Couple Character" className={styles.characterImg} />
          <img src="/assets/cat.png" alt="Cute Cat" className={styles.catCoverImg} />

          <button
            className={styles.openBtnHitbox}
            onClick={() => {
              setGameState('gender');
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
      {gameState === 'gender' && (
        <div className={styles.genderScreen}>
          <div className={styles.characterHeaderContainer}>
            <p className={styles.charTagline}>{tagline}</p>
            <div className={styles.charNamesGroup}>
              <span className={styles.charGroom}>{brideName}</span>
              <span className={styles.charAmpersand}>&</span>
              <span className={styles.charBride}>{groomName}</span>
            </div>
            <p className={styles.charDate}>{weddingDateLabel}</p>
          </div>

          <div className={styles.instructionTextGroup}>
            <p className={styles.instructionLine1}>Choose your character</p>
            <p className={styles.instructionLine2}>⬇️&emsp;&emsp;&emsp;or&emsp;&emsp;&emsp;⬇️</p>
          </div>

          <div className={styles.characterSelectionRow}>
            <div 
              className={styles.characterBox} 
              onClick={() => { setGender('man'); setGameState('playing'); }}
            >
              <img src="/assets/man characters.png" alt="Man Character" className={styles.characterPortrait} />
              <button className={styles.manSelectButton}><span>Man</span></button>
            </div>

            <div 
              className={styles.characterBox} 
              onClick={() => { setGender('woman'); setGameState('playing'); }}
            >
              <img src="/assets/woman characters.png" alt="Woman Character" className={styles.characterPortrait} />
              <button className={styles.womanSelectButton}><span>Woman</span></button>
            </div>
          </div>
        </div>
      )}

      {/* 3. GAMEPLAY */}
      {gameState === 'playing' && (
        <div className={styles.gameStage}>
          <div className={styles.headerInfoOverlay}>
            <p className={styles.charTagline}>{tagline}</p>
            <div className={styles.charNamesGroup}>
              <span className={styles.charGroom}>{brideName}</span>
              <span className={styles.charAmpersand}>&</span>
              <span className={styles.charBride}>{groomName}</span>
            </div>
            <p className={styles.charDate}>{weddingDateLabel}</p>
          </div>

          <div className={styles.viewport}>
            <div
              className={styles.worldTrack}
              style={{ width: `${WORLD_WIDTH}px`, transform: `translateX(-${cameraX}px)` }}
            >
              {/* RENDERING ORNAMEN / DEKORASI HIASAN */}
              {DECORATIONS.map((dec) => (
                <div
                  key={dec.id}
                  style={{
                    position: 'absolute',
                    left: `${dec.xPos}px`,
                    bottom: `${dec.bottom || 45}px`,
                    zIndex: dec.zIndex || 8,
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src={dec.image}
                    alt={dec.id}
                    style={{
                      width: dec.width ? `${dec.width}px` : 'auto',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </div>
              ))}

              {/* RENDERING CHECKPOINTS */}
              {CHECKPOINTS.map((cp) => {
                const isVenue = cp.id === 'venue';
                const isPlayerToTheRight = playerX > cp.xPos;

                return (
                  <div
                    key={cp.id}
                    className={isVenue ? styles.venueWorldContainer : styles.npcWorldContainer}
                    style={{ left: `${cp.xPos}px` }}
                  >
                    <img
                      src={cp.npcImage}
                      alt={cp.title}
                      className={`${isVenue ? styles.venueImg : styles.npcImg} ${cp.className || ''}`}
                      style={{
                        transform: (cp.id === 'rsvp' && isPlayerToTheRight) ? 'scaleX(-1)' : 'scaleX(1)',
                        transition: 'transform 0.03s ease-out',
                      }}
                    />
                  </div>
                );
              })}

              {/* KARAKTER UTAMA */}
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

          {/* TOMBOL KONTROL */}
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
            activeModal === 'thanks' ? styles.modalCard_thanks : 
            activeModal === 'gallery' ? styles.modalCard_gallery : ''
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
                <h3>Allah's Blessings Message</h3>
                <p> "And among the signs of His power is that He created for you wives of your own kind, so that you would be inclined and feel at ease with them, and He made among you a feeling of love and affection. Indeed, in that there are truly signs for a person who thinks (لِقَوْمٍ يَتَفَكَّرُونَ )."<br></br>(QS. Ar-Rum: 21)</p>
              </div>
            )}

            {/* 2. MODAL RSVP */}
            {activeModal === 'rsvp' && (
              <div className={styles.modalBody}>
                <h3>RSVP</h3>
                <p className={styles.rsvpWelcome}>
                  Hi, Dear <strong>{guestName || 'Guest'}</strong>!<br />
                  Kindly confirm your attendance.
                </p>
                
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    
                    // Ambil data dari form yang diisi tamu
                    const formData = new FormData(e.currentTarget);
                    const guestNameVal = formData.get('guestName');
                    const attendanceVal = formData.get('attendance');

                    try {
                      // Ini adalah URL Google Script Anda yang tadi disalin
                      const scriptUrl = 'https://script.google.com/macros/s/AKfycbxxF6gvQbH_UWhJTYKJuwEdMG0WR5smIHZG-9zCLY1TRhHqCCjvwRgCb4tOP6pMtgdalQ/exec';

                      // Proses mengirim data ke Google Sheets
                      await fetch(scriptUrl, {
                        method: 'POST',
                        mode: 'no-cors', // Penting agar tidak diblokir oleh browser
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          guestName: guestNameVal,
                          attendance: attendanceVal
                        })
                      });

                      // Munculkan notifikasi sukses dan tutup modal
                      alert('Thank you! Your confirmation has been successfully saved.');
                      setActiveModal(null);
                    } catch (error) {
                      alert('Oops! Something went wrong. Please try again.');
                    }
                  }}
                  className={styles.formGroup}
                >
                  <input 
  type="text" 
  name="guestName" 
  placeholder="Guest Name" 
  defaultValue={guestName || ''} 
  required 
/>
                  
                  <select name="attendance" required defaultValue="">
                    <option value="" disabled hidden>Attendance Confirmation</option>
                    <option value="Attending (1 Guest)">Attending (1 Guest)</option>
                    <option value="Attending (2 Guests)">Attending (2 Guests)</option>
                    <option value="Not Attending">Not Attending</option>
                  </select>
                  
                  <button type="submit" className={styles.submitBtn}>
                    Send Your Confirmation
                  </button>
                </form>

              </div>
            )}

            {/* 3. MODAL GROOM & BRIDE (LOCATION CHECKPOINT) */}
{activeModal === 'location' && (
  <div className={styles.modalBody}>
    <h3>Groom & Bride</h3>
    
    <div className={styles.coupleProfileContainer}>
      
      {/* Profil Mempelai Pria */}
      <div className={styles.profileCard}>
        <div className={styles.imagePlaceholder}>
          {/* Masukkan tag <img> Anda di sini nanti, contoh: */}
          <img src="/assets/DINAR.jpeg" alt="Dinar Suherlan" className={styles.profileImg} />
          
        </div>
        <h4 className={styles.personName}>Dinar Suherlan</h4>
        <p className={styles.parentText}>
          Son of Mr. Didih Suherman<br />& Mrs. Marnah
        </p>
      </div>

      <div className={styles.profileDivider}>&</div>

      {/* Profil Mempelai Wanita */}
      <div className={styles.profileCard}>
        <div className={styles.imagePlaceholder}>
          {/* Masukkan tag <img> Anda di sini nanti, contoh: */}
          <img src="/assets/EL.jpeg" alt="Elrisa Salsabilla" className={styles.profileImg} />
          
        </div>
        <h4 className={styles.personName}>Elrisa Salsabilla</h4>
        <p className={styles.parentText}>
          Daughter of Mr. Ridarnis<br />& Mrs. Elvi Suryani
        </p>
      </div>

    </div>
  </div>
)}

{/* 4. MODAL WISHES (Sebelumnya Venue) */}
            {activeModal === 'venue' && (
              <div className={styles.modalBody}>
                <h3>Thank You!</h3>
                <p>
                  We look forward to celebrating our special day with you. It would be an honor and a joy to have you there to share in our happiness and bless our union.
                </p>
                <p className={styles.coupleSign}>
                  With love,<br />
                  <strong>Elrisa Salsabilla & Dinar Suherlan</strong>
                </p>

                <hr className={styles.divider} />

                {/* FORM KIRIM WISHES */}
                <h4>Send Your Wishes</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const nameVal = formData.get('wishName') as string;
                    const wishVal = formData.get('wishMessage') as string;

                    try {
                      const scriptUrl = 'https://script.google.com/macros/s/AKfycbxxF6gvQbH_UWhJTYKJuwEdMG0WR5smIHZG-9zCLY1TRhHqCCjvwRgCb4tOP6pMtgdalQ/exec';
                      
                      await fetch(scriptUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'wish',
                          name: nameVal,
                          wish: wishVal
                        })
                      });

                      alert('Thank you for your wishes!');
                      (e.target as HTMLFormElement).reset();

                      // Langsung tampilkan doa yang baru dikirim ke layar tanpa harus refresh
                      setWishesList([{ timestamp: new Date().toISOString(), name: nameVal, wish: wishVal }, ...wishesList]);
                    } catch (error) {
                      alert('Oops! Something went wrong. Please try again.');
                    }
                  }}
                  className={styles.formGroup}
                >
                  <input 
                    type="text" 
                    name="wishName" 
                    placeholder="Full Name" 
                    defaultValue={guestName || ''} 
                    required 
                  />
                  <textarea 
                    name="wishMessage" 
                    placeholder="Your Wishes" 
                    rows={3} 
                    required 
                    className={styles.wishTextArea}
                  ></textarea>
                  <button type="submit" className={styles.submitBtn}>Submit</button>
                </form>

                {/* AREA DAFTAR WISHES */}
                <div className={styles.wishesContainer}>
                  <h4>Your Wishes</h4>
                  {isLoadingWishes ? (
                    <p className={styles.loadingText}>Loading wishes...</p>
                  ) : wishesList.length === 0 ? (
                    <p className={styles.loadingText}>Be the first to send a wish!</p>
                  ) : (
                    <div className={styles.wishesList}>
                      {wishesList.map((item, index) => (
                        <div key={index} className={styles.wishItem}>
                          <strong>{item.name}</strong>
                          <p>{item.wish}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                    📋 COPY
                  </button>
                </div>
                <p className={styles.giftThanks}>With love and gratitude.</p>
              </div>
            )}

{/* 6. MODAL WEDDING DETAILS (THANKS CHECKPOINT) */}
{activeModal === 'thanks' && (
  <div className={styles.modalBody}>
    <h3>Wedding Details</h3>
    
    <p className={styles.detailWelcome}>
      Hi, <strong>{guestName || 'Guest'}</strong><br />
      Welcome to the wedding of <strong>Elrisa & Dinar</strong>
    </p>

    <div className={styles.scheduleBox}>
      <div className={styles.scheduleItem}>
        <h4>Wedding Ceremony</h4>
        <p>Sunday, 22nd November 2026</p>
        <p><strong>07:00 AM - 09:00 AM</strong></p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.scheduleItem}>
        <h4>Wedding Reception</h4>
        <p>Sunday, 22nd November 2026</p>
        <p><strong>10:00 AM - 02:30 PM</strong></p>
      </div>
    </div>

    <div className={styles.venueCard}>
      <h4>Venue</h4>
      <p className={styles.venueNameText}><strong>Gedung Balai Rakyat Depok I / Gedung Serbaguna</strong></p>
      <p className={styles.venueAddressText}>
        Jl. Bangau Raya No.192-174, Depok Jaya, Pancoran Mas, Depok City, West Java 16432
      </p>
    </div>

    <button 
      type="button"
      className={styles.submitBtn} 
      onClick={() => window.open('https://maps.app.goo.gl/TZCobjjfrTrV73gA6?g_st=ac', '_blank')}
    >
      📍 View Location
    </button>
  </div>
)}

            {/* 7. MODAL GALERI FOTO (ENDGAME) */}
            {activeModal === 'gallery' && (
              <div className={styles.modalBody}>
                <h3>Our Gallery</h3>
                <p>A Glimpse of Our Happiness:</p>
                <div className={styles.galleryGrid}>
                  <img src="/assets/1.jpeg" alt="Momen 1" className={styles.galleryThumb} />
                  <img src="/assets/2.jpeg" alt="Momen 2" className={styles.galleryThumb} />
                  <img src="/assets/3.jpeg" alt="Momen 3" className={styles.galleryThumb} />
                  <img src="/assets/11.jpeg" alt="Momen 1" className={styles.galleryThumb} />
                  <img src="/assets/12.png" alt="Momen 2" className={styles.galleryThumb} />
                  <img src="/assets/13.jpeg" alt="Momen 3" className={styles.galleryThumb} />
                  <img src="/assets/14.jpeg" alt="Momen 1" className={styles.galleryThumb} />
                  <img src="/assets/15.jpeg" alt="Momen 2" className={styles.galleryThumb} />
                </div>
                <p className={styles.coupleSign}>
                  Terima kasih telah berjalan bersama kami hingga akhir!<br />
                  <strong>Elrisa Salsabilla & Dinar Suherlan</strong>
                </p>
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