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
  venueName?: string;
  venueAddress?: string;
  venueMapsUrl?: string;
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
];

// DAFTAR SELURUH ASET GAMBAR UNTUK DI-PRELOAD LENGKAP
const ASSETS_TO_LOAD = [
  '/assets/Background.png',
  '/assets/backgroundchosecaharacter.png',
  '/assets/background3.png',
  '/assets/ground.png',
  '/assets/text border.png',
  '/assets/text border2.png',
  '/assets/Flower.png',
  '/assets/bird.png',
  '/assets/Open Invitation Background.png',
  '/assets/cat.png',
  '/assets/Frame.png',
  '/assets/kucing.png', // Sprite sheet 5-frame jalan

  // Karakter & Sprite
  '/assets/man-walk2.png',
  '/assets/woman-walk.png',
  '/assets/NewGroomBrideCharacter.png',
  '/assets/man characters.png',
  '/assets/woman characters.png',
  '/assets/man background.png',
  '/assets/woman background.png',

  // Checkpoints & Ornamen
  '/assets/Message.png',
  '/assets/Groom-Bride-info.png',
  '/assets/mempelai.png',
  '/assets/npc-rsvp.png',
  '/assets/Gift.png',
  '/assets/Groom & Bride.png',
  '/assets/Gallery.png',
  '/assets/pointing.png',
  '/assets/Chair.png',
  '/assets/rumah.png',

  // Foto Mempelai & Galeri
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

// Daftar foto sesuai urutan grid pada Layout.jpg
const galleryImages = [
  '/assets/14.jpeg',    // 0: Kiri Atas
  '/assets/15.jpeg',    // 1: Tengah Atas
  '/assets/13.jpeg',    // 2: Kanan Atas
  '/assets/12.png',     // 3: Kiri Tengah
  '/assets/DINAR.jpeg', // 4: Tengah (Atas kecil)
  '/assets/EL.jpeg',    // 5: Tengah (Bawah kecil)
  '/assets/11.jpeg',    // 6: Kanan Tengah
  '/assets/1.jpeg',     // 7: Kiri Bawah
  '/assets/3.jpeg',     // 8: Tengah Bawah
  '/assets/2.jpeg',     // 9: Kanan Bawah
];

export default function WeddingJourneyInvitation({
  groomName = 'Dinar',
  brideName = 'Elrisa',
  guestName = 'Jojo & Jeje',
  tagline = 'THE WEDDING OF',
  weddingDateLabel = '22 . 11 . 2026',
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

  // State Loading Submit Form (UX Feedback)
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [isSubmittingWish, setIsSubmittingWish] = useState(false);

  // Player & Game Loop States
  const [playerX, setPlayerX] = useState(100);
  const playerXRef = useRef(100);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

// State & Ref Karakter Kucing (AI Pet)
  const [catX, setCatX] = useState(50);
  const catXRef = useRef(50);
  const [catDirection, setCatDirection] = useState<'right' | 'left'>('right');
  const [isCatWalking, setIsCatWalking] = useState(false);

  useEffect(() => {
    catXRef.current = catX;
  }, [catX]);

  // State untuk menampung daftar doa & Lightbox
  const [wishesList, setWishesList] = useState<WishItem[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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

  // Preload Aset Gambar Utama dengan GPU Async Decoding
  useEffect(() => {
    let isMounted = true;
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_LOAD.length;

    const loadSingleAsset = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          if ('decode' in img) {
            img.decode().then(() => resolve()).catch(() => resolve());
          } else {
            resolve();
          }
        };
        img.onerror = () => resolve();
      });
    };

    Promise.all(
      ASSETS_TO_LOAD.map((src) =>
        loadSingleAsset(src).then(() => {
          if (isMounted) {
            loadedCount += 1;
            setLoadProgress(Math.round((loadedCount / totalAssets) * 100));
          }
        })
      )
    ).then(() => {
      if (isMounted) {
        setTimeout(() => setIsLoading(false), 300);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

 // Optimized Game Loop (Pemain, AI Kucing, & Sensor Checkpoint)
  useEffect(() => {
    if (gameState !== 'playing' || activeModal) {
      walkingStateRef.current = { left: false, right: false };
      setIsWalking(false);
      setIsCatWalking(false);
      return;
    }

    let animationFrameId: number;
    const speed = 2.5;       // Kecepatan pemain
    const stopDistance = 70; // Radius comfort zone tempat kucing berhenti
    const catSpeed = 2.0;    // Kecepatan kucing menyusul

    const gameLoop = () => {
      const { left, right } = walkingStateRef.current;
      let currX = playerXRef.current;

      // 1. Pergerakan Pemain Utama
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

      // 2. Logika AI Kucing Menyusul Pemain
      const currCatX = catXRef.current;
      const distanceToPlayer = currX - currCatX;

      if (Math.abs(distanceToPlayer) > stopDistance) {
        const moveDir = distanceToPlayer > 0 ? 1 : -1;
        const newCatX = currCatX + moveDir * catSpeed;
        
        setCatX(newCatX);
        setCatDirection(moveDir === 1 ? 'right' : 'left');
        setIsCatWalking(true);
      } else {
        setIsCatWalking(false);
      }

      // 3. Sensor Trigger Checkpoint
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

  // Handlers Navigasi Lightbox (Aman Parser TSX)
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

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
          {/* Header Clean (Tanpa text border) */}
          <div className={styles.characterHeaderContainer}>
            <p className={styles.charTagline}>{tagline}</p>
            <div className={styles.charNamesGroup}>
              <span className={styles.charGroom}>{brideName}</span>
              <span className={styles.charAmpersand}>&</span>
              <span className={styles.charBride}>{groomName}</span>
            </div>
            <p className={styles.charDate}>{weddingDateLabel}</p>
          </div>

          {/* Card Melayang Instruksi & Tombol Pill */}
          <div className={styles.chooseCardContainer}>
            <h3 className={styles.chooseTitle}>Choose Your Character</h3>
            <div className={styles.pillButtonRow}>
              <button 
                className={styles.pillBtnMan}
                onClick={() => { setGender('man'); setGameState('playing'); }}
              >
                Man
              </button>
              <button 
                className={styles.pillBtnWoman}
                onClick={() => { setGender('woman'); setGameState('playing'); }}
              >
                Woman
              </button>
            </div>
          </div>

          {/* Standee Karakter */}
          <div className={styles.characterSelectionRow}>
            <div 
              className={styles.characterBox} 
              onClick={() => { setGender('man'); setGameState('playing'); }}
            >
              <img src="/assets/man characters.png" alt="Man Character" className={styles.characterPortrait} />
            </div>

            <div 
              className={styles.characterBox} 
              onClick={() => { setGender('woman'); setGameState('playing'); }}
            >
              <img src="/assets/woman characters.png" alt="Woman Character" className={styles.characterPortrait} />
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
              style={{ width: `${WORLD_WIDTH}px`, transform: `translate3d(-${cameraX}px, 0, 0)` }}
            >
              {/* KARAKTER KUCING (AI PET) */}
              <div
                className={styles.catWorldContainer}
                style={{
                  left: `${catX}px`,
                  transform: `translateX(-50%) ${catDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)'}`,
                }}
              >
                <div
                  className={`${styles.catSpriteFrame} ${isCatWalking ? styles.animateCatWalk : ''}`}
                />
              </div>
              {/* RENDERING ORNAMEN / DEKORASI */}
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
                <p> "And among the signs of His power is that He created for you wives of your own kind, so that you would be inclined and feel at ease with them, and He made among you a feeling of love and affection. Indeed, in that there are truly signs for a person who thinks (لِقَوْمٍ يَتَفَكَّرُونَ )."<br />(QS. Ar-Rum: 21)</p>
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
                    if (isSubmittingRsvp) return;
                    setIsSubmittingRsvp(true);
                    
                    const formData = new FormData(e.currentTarget);
                    const guestNameVal = formData.get('guestName');
                    const attendanceVal = formData.get('attendance');

                    try {
                      const scriptUrl = 'https://script.google.com/macros/s/AKfycbxxF6gvQbH_UWhJTYKJuwEdMG0WR5smIHZG-9zCLY1TRhHqCCjvwRgCb4tOP6pMtgdalQ/exec';

                      await fetch(scriptUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          guestName: guestNameVal,
                          attendance: attendanceVal
                        })
                      });

                      alert('Thank you! Your confirmation has been successfully saved.');
                      setActiveModal(null);
                    } catch (error) {
                      alert('Oops! Something went wrong. Please try again.');
                    } finally {
                      setIsSubmittingRsvp(false);
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
                  
                  <button type="submit" className={styles.submitBtn} disabled={isSubmittingRsvp}>
                    {isSubmittingRsvp ? 'Sending...' : 'Send Your Confirmation'}
                  </button>
                </form>

              </div>
            )}

            {/* 3. MODAL GROOM & BRIDE */}
            {activeModal === 'location' && (
              <div className={styles.modalBody}>
                <h3>Groom & Bride</h3>
                
                <div className={styles.coupleProfileContainer}>
                  <div className={styles.profileCard}>
                    <div className={styles.imagePlaceholder}>
                      <img src="/assets/DINAR.jpeg" alt="Dinar Suherlan" className={styles.profileImg} />
                    </div>
                    <h4 className={styles.personName}>Dinar Suherlan</h4>
                    <p className={styles.parentText}>
                      Third Son of Mr. Didih Suherman <br></br>& Mrs. Marnah
                    </p>
                  </div>

                  <div className={styles.profileDivider}>&</div>

                  <div className={styles.profileCard}>
                    <div className={styles.imagePlaceholder}>
                      <img src="/assets/EL.jpeg" alt="Elrisa Salsabilla" className={styles.profileImg} />
                    </div>
                    <h4 className={styles.personName}>Elrisa Salsabilla</h4>
                    <p className={styles.parentText}>
                      Third Daughter of Mr. Ridarnis <br></br>& Mrs. Elvi Suryani
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MODAL WISHES */}
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
                    if (isSubmittingWish) return;
                    setIsSubmittingWish(true);

                    const formTarget = e.currentTarget;
                    const formData = new FormData(formTarget);
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
                      formTarget.reset();

                      setWishesList([{ timestamp: new Date().toISOString(), name: nameVal, wish: wishVal }, ...wishesList]);
                    } catch (error) {
                      alert('Oops! Something went wrong. Please try again.');
                    } finally {
                      setIsSubmittingWish(false);
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
                  <button type="submit" className={styles.submitBtn} disabled={isSubmittingWish}>
                    {isSubmittingWish ? 'Submitting...' : 'Submit'}
                  </button>
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
                  <p className={styles.accountNumber}><strong>7152028281</strong></p>
                  <p className={styles.accountName}>a.n. Dinar Suherlan</p>
                  <button 
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => {
                      navigator.clipboard.writeText('7152028281');
                      alert('Nomor rekening BCA berhasil disalin!');
                    }}
                  >
                    📋 COPY
                  </button>
                   <p className={styles.bankName}>Bank CIMBBIAGA</p>
                  <p className={styles.accountNumber}><strong>763380771700</strong></p>
                  <p className={styles.accountName}>a.n. Elrisa Salsabilla</p>
                  <button 
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => {
                      navigator.clipboard.writeText('763380771700');
                      alert('Nomor rekening CIMBNIAGA berhasil disalin!');
                    }}
                  >
                    📋 COPY
                  </button>
                </div>
                <p className={styles.giftThanks}>With love and gratitude.</p>
              </div>
            )}

            {/* 6. MODAL WEDDING DETAILS */}
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

            {/* 7. MODAL GALERI FOTO */}
            {activeModal === 'gallery' && (
              <div className={styles.modalBodyGallery}>
                <h3 className={styles.galleryHeaderTitle}>Our Precious Moments</h3>
                
                <div className={styles.galleryFrameContainer}>
                  <div className={styles.galleryGridBento}>
                    {/* Baris 1 */}
                    <img src={galleryImages[0]} onClick={() => setSelectedImageIndex(0)} className={styles.gridImg_tall} alt="Moment 14" />
                    <img src={galleryImages[1]} onClick={() => setSelectedImageIndex(1)} className={styles.gridImg_tall} alt="Moment 15" />
                    <img src={galleryImages[2]} onClick={() => setSelectedImageIndex(2)} className={styles.gridImg_tall} alt="Moment 13" />
                    
                    {/* Baris 2 */}
                    <img src={galleryImages[3]} onClick={() => setSelectedImageIndex(3)} className={styles.gridImg_tall} alt="Moment 12" />
                    <div className={styles.gridImg_stackedCol}>
                      <img src={galleryImages[4]} onClick={() => setSelectedImageIndex(4)} className={styles.gridImg_small} alt="Dinar" />
                      <img src={galleryImages[5]} onClick={() => setSelectedImageIndex(5)} className={styles.gridImg_small} alt="Elrisa" />
                    </div>
                    <img src={galleryImages[6]} onClick={() => setSelectedImageIndex(6)} className={styles.gridImg_tall} alt="Moment 11" />
                    
                    {/* Baris 3 */}
                    <img src={galleryImages[8]} onClick={() => setSelectedImageIndex(7)} className={styles.gridImg_tall} alt="Moment 1" />
                    <img src={galleryImages[7]} onClick={() => setSelectedImageIndex(8)} className={styles.gridImg_tall} alt="Moment 3" />
                    <img src={galleryImages[9]} onClick={() => setSelectedImageIndex(9)} className={styles.gridImg_tall} alt="Moment 2" />
                  </div>
                </div>

                <p className={styles.galleryQuote}>
                  "Our forever begins with you by our side"<br />
                  <span>- Elrisa & Dinar -</span>
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. LIGHTBOX OVERLAY PERBESAR GAMBAR */}
      {selectedImageIndex !== null && (
        <div className={styles.lightboxOverlay}>
          <button 
            className={styles.lightboxCloseBtn} 
            onClick={() => setSelectedImageIndex(null)}
          >
            ✕
          </button>
          
          <button 
            className={styles.lightboxNavBtnLeft} 
            onClick={handlePrevImage}
          >
            ◀
          </button>
          
          <img 
            src={galleryImages[selectedImageIndex]} 
            alt="Enlarged Moment" 
            className={styles.lightboxImage} 
          />
          
          <button 
            className={styles.lightboxNavBtnRight} 
            onClick={handleNextImage}
          >
            ▶
          </button>
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