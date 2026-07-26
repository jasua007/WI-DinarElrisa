'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './WeddingJourneyInvitation.module.css';

// 1. Interface TypeScript untuk Props (Menghindari Error Build Vercel)
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
  onRsvpSubmit?: (data: any) => Promise<any> | void;
}

interface Checkpoint {
  id: string;
  xPos: number; // Posisi koordinat X dalam piksel dunia game
  title: string;
  npcLabel: string;
  npcImage: string;
}

const WORLD_WIDTH = 2400; // Total panjang dunia game (piksel)

const CHECKPOINTS: Checkpoint[] = [
  {
    id: 'welcome',
    xPos: 300,
    title: 'Selamat Datang',
    npcLabel: 'Info Pernikahan',
    npcImage: '/assets/groom.png',
  },
  {
    id: 'location',
    xPos: 800,
    title: 'Waktu & Lokasi',
    npcLabel: 'Lihat Denah',
    npcImage: '/assets/clocktower.png',
  },
  {
    id: 'rsvp',
    xPos: 1300,
    title: 'Konfirmasi Kehadiran',
    npcLabel: 'RSVP',
    npcImage: '/assets/npc-rsvp.png',
  },
  {
    id: 'gift',
    xPos: 1800,
    title: 'Kado Digital & QRIS',
    npcLabel: 'Kirim Hadiah',
    npcImage: '/assets/groom.png',
  },
  {
    id: 'thanks',
    xPos: 2200,
    title: 'Terima Kasih',
    npcLabel: 'Pesan Spesial',
    npcImage: '/assets/bride.png',
  },
];

// 2. Menerima Props dari app/page.tsx
export default function WeddingJourneyInvitation({
  groomName = 'Dinar',
  brideName = 'Elrisa',
  guestName,
  tagline = 'THE WEDDING OF',
  weddingDateLabel = '30 . 06 . 26',
  onRsvpSubmit,
}: WeddingJourneyProps) {
  const [gameState, setGameState] = useState<'cover' | 'gender' | 'playing'>('cover');
  const [gender, setGender] = useState<'man' | 'woman'>('man');
  
  // Game State Engine
  const [playerX, setPlayerX] = useState(100); // Posisi awal pemain
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // References untuk holding state keyboard / touch
  const walkingStateRef = useRef({ left: false, right: false });

  // Game Loop untuk Hold-To-Walk yang Mulus (60FPS)
  useEffect(() => {
    if (gameState !== 'playing' || activeModal) return;

    let animationFrameId: number;

    const gameLoop = () => {
      const { left, right } = walkingStateRef.current;
      const speed = 4; // Kecepatan jalan karakter

      if (left && !right) {
        setPlayerX((prev) => Math.max(50, prev - speed));
        setDirection('left');
        setIsWalking(true);
      } else if (right && !left) {
        setPlayerX((prev) => Math.min(WORLD_WIDTH - 100, prev + speed));
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

  // Keyboard Event Listeners (Hold to walk)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || activeModal) return;
      if (e.key === 'ArrowRight' || e.key === 'd') walkingStateRef.current.right = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') walkingStateRef.current.left = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd') walkingStateRef.current.right = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') walkingStateRef.current.left = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, activeModal]);

  // Cek Checkpoint mana yang dekat dengan Karakter (Proximity Trigger)
  const nearbyCheckpoint = CHECKPOINTS.find(
    (cp) => Math.abs(cp.xPos - playerX) < 90
  );

  // Kalkulasi Kamera Offset (Karakter selalu dekat tengah layar)
  const cameraX = Math.max(0, playerX - 160);

  return (
    <div className={styles.wrapper}>
      {/* ================= 1. COVER SCREEN ================= */}
      {gameState === 'cover' && (
        <div className={styles.cover}>
          <div className={styles.headerInfo}>
            <p className={styles.tagline}>{tagline}</p>
            <h1 className={styles.mainTitle}>{brideName} ♥ {groomName}</h1>
            <p className={styles.dateText}>{weddingDateLabel}</p>
            {guestName && <p className={styles.guestText}>Kepada: {guestName}</p>}
          </div>

          <div className={styles.coverCoupleWrapper}>
            <img src="/assets/groom.png.png" alt="Groom" className={styles.coverGroomImg} />
            <img src="/assets/bride.png.png" alt="Bride" className={styles.coverBrideImg} />
          </div>

          <button className={styles.openButton} onClick={() => setGameState('gender')}>
            open invitation
          </button>
        </div>
      )}

      {/* ================= 2. PILIH KARAKTER ================= */}
      {gameState === 'gender' && (
        <div className={styles.genderScreen}>
          <div className={styles.headerInfo}>
            <p className={styles.tagline}>{tagline}</p>
            <h1 className={styles.mainTitle}>{brideName} ♥ {groomName}</h1>
            <p className={styles.dateText}>{weddingDateLabel}</p>
          </div>

          <div className={styles.characterPreviewArea}>
            <div
              className={`${styles.previewSprite} ${
                gender === 'woman' ? styles.womanPreview : styles.manPreview
              }`}
            />
          </div>

          <div className={styles.genderDialogCard}>
            <p>Choose your character:</p>
            <div className={styles.genderBtnGroup}>
              <button
                className={`${styles.genderBtn} ${styles.manBtn}`}
                onClick={() => { setGender('man'); setGameState('playing'); }}
              >
                Man
              </button>
              <button
                className={`${styles.genderBtn} ${styles.womanBtn}`}
                onClick={() => { setGender('woman'); setGameState('playing'); }}
              >
                Woman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. GAME SIDE-SCROLLER REAL 2D ================= */}
      {gameState === 'playing' && (
        <div className={styles.gameStage}>
          <div className={styles.headerInfoOverlay}>
            <p className={styles.tagline}>{tagline}</p>
            <h2 className={styles.gameTitle}>{brideName} ♥ {groomName}</h2>
            <p className={styles.dateText}>{weddingDateLabel}</p>
          </div>

          {/* Interactive Pill ketika Dekat Checkpoint */}
          {nearbyCheckpoint && (
            <div className={styles.interactivePillWrapper}>
              <button
                className={styles.interactivePill}
                onClick={() => setActiveModal(nearbyCheckpoint.id)}
              >
                <span>{nearbyCheckpoint.npcLabel}</span>
              </button>
            </div>
          )}

          {/* Viewport Game */}
          <div className={styles.viewport}>
            {/* World Track yang Bergerak Mengikuti Kamera */}
            <div
              className={styles.worldTrack}
              style={{ transform: `translateX(-${cameraX}px)` }}
            >
              {/* Checkpoints & NPCs */}
              {CHECKPOINTS.map((cp) => (
                <div
                  key={cp.id}
                  className={styles.npcWorldContainer}
                  style={{ left: `${cp.xPos}px` }}
                >
                  <img src={cp.npcImage} alt={cp.title} className={styles.npcImg} />
                </div>
              ))}

              {/* Player Character Sprite */}
              <div
                className={styles.playerWorldContainer}
                style={{
                  left: `${playerX}px`,
                  transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
                }}
              >
                <div
                  className={`${styles.spriteFrame} ${
                    gender === 'woman' ? styles.womanSprite : styles.manSprite
                  } ${isWalking ? styles.animateWalk : ''}`}
                />
              </div>

              {/* Ground Floor Tile */}
              <div
                className={styles.groundBar}
                style={{ width: `${WORLD_WIDTH}px` }}
              />
            </div>
          </div>

          {/* On-Screen Hold Controls */}
          <div className={styles.controlsBar}>
            <button
              className={styles.arrowBtn}
              onMouseDown={() => (walkingStateRef.current.left = true)}
              onMouseUp={() => (walkingStateRef.current.left = false)}
              onTouchStart={() => (walkingStateRef.current.left = true)}
              onTouchEnd={() => (walkingStateRef.current.left = false)}
            >
              ◀
            </button>

            <button
              className={styles.swapGenderBtn}
              onClick={() => setGender(gender === 'man' ? 'woman' : 'man')}
            >
              {gender === 'man' ? '♂' : '♀'}
            </button>

            <button
              className={styles.arrowBtn}
              onMouseDown={() => (walkingStateRef.current.right = true)}
              onMouseUp={() => (walkingStateRef.current.right = false)}
              onTouchStart={() => (walkingStateRef.current.right = true)}
              onTouchEnd={() => (walkingStateRef.current.right = false)}
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* ================= 4. MODALS ================= */}
      {activeModal && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setActiveModal(null)}>✕</button>

            {activeModal === 'rsvp' && (
              <div className={styles.modalBody}>
                <h3>Konfirmasi Kehadiran</h3>
                <p>Isi form di bawah untuk mengonfirmasi kehadiran Anda:</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (onRsvpSubmit) {
                      onRsvpSubmit({ status: 'attending' });
                    }
                    alert('Terima kasih! Konfirmasi Anda telah tersimpan.');
                    setActiveModal(null);
                  }}
                  className={styles.formGroup}
                >
                  <input type="text" placeholder="Nama Lengkap" defaultValue={guestName || ''} required />
                  <select required>
                    <option value="">Jumlah Kehadiran</option>
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                  </select>
                  <button type="submit" className={styles.submitBtn}>Kirim RSVP</button>
                </form>
              </div>
            )}

            {activeModal === 'location' && (
              <div className={styles.modalBody}>
                <h3>Waktu & Lokasi Acara</h3>
                <p><strong>Akad Nikah:</strong> 08.00 WIB</p>
                <p><strong>Resepsi:</strong> 11.00 - Selesai</p>
                <p>Gedung Grand Ballroom, Jakarta</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => window.open('https://maps.google.com', '_blank')}
                >
                  Buka Google Maps
                </button>
              </div>
            )}

            {activeModal === 'gift' && (
              <div className={styles.modalBody}>
                <h3>Kado Digital & QRIS</h3>
                <p>BCA: <strong>1234567890</strong> a.n {brideName}</p>
                <div className={styles.qrisBox}>
                  <p>[ GAMBAR QRIS REKENING ]</p>
                </div>
              </div>
            )}

            {(activeModal === 'thanks' || activeModal === 'welcome') && (
              <div className={styles.modalBody}>
                <h3>Thank You!</h3>
                <p>Kehadiran serta doa restu Anda merupakan hadiah terindah bagi pernikahan kami.</p>
                <p className={styles.coupleSign}><strong>{brideName} & {groomName}</strong></p>
              </div>    
            )}
          </div>
        </div>
      )}
    </div>
  );
}