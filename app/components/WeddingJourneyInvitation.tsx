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

const CHECKPOINTS: Checkpoint[] = [
  { id: 'welcome', xPos: 350, title: 'Selamat Datang', npcLabel: 'Info Pernikahan', npcImage: '/assets/groom.png' },
  { id: 'location', xPos: 850, title: 'Waktu & Lokasi', npcLabel: 'Lihat Denah', npcImage: '/assets/npc-location.png' },
  { id: 'rsvp', xPos: 1350, title: 'Konfirmasi Kehadiran', npcLabel: 'RSVP', npcImage: '/assets/npc-rsvp.png' },
  { id: 'gift', xPos: 1850, title: 'Kado Digital & QRIS', npcLabel: 'Kirim Hadiah', npcImage: '/assets/groom.png' },
  { id: 'thanks', xPos: 2250, title: 'Terima Kasih', npcLabel: 'Pesan Spesial', npcImage: '/assets/bride.png' },
  { id: 'venue', xPos: 2750, title: 'Lokasi Acara', npcLabel: 'Tempat Acara', npcImage: '/assets/clocktower.png' },
];

export default function WeddingJourneyInvitation({
  groomName = 'Dinar',
  brideName = 'Elrisa',
  guestName = 'Jojo & Jeje',
  tagline = 'THE WEDDING OF',
  weddingDateLabel = '30 . 11 . 26',
  venueName = 'Menara Waktu Grand Hall',
  venueAddress = 'Jl. Contoh Raya No. 10, Jakarta',
  venueMapsUrl = 'https://maps.google.com',
  onRsvpSubmit,
}: WeddingJourneyProps) {
  const [gameState, setGameState] = useState<'cover' | 'gender' | 'playing'>('cover');
  const [gender, setGender] = useState<'man' | 'woman'>('man');

  const [playerX, setPlayerX] = useState(100);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const walkingStateRef = useRef({ left: false, right: false });

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing' || activeModal) return;

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
  const cameraX = Math.max(0, Math.min(WORLD_WIDTH - 340, playerX - 170));

  return (
    <div className={styles.wrapper}>
      {/* 1. COVER SCREEN (NEW ELEGANT DESIGN) */}
      {gameState === 'cover' && (
        <div className={styles.cover}>
          {/* ORNAMENTS (Animated Reveal) */}
          <img src="/assets/goldenarch.png" alt="" className={styles.goldenArch} />
          <img src="/assets/bungasudutkiriatas.png" alt="" className={`${styles.flowerCorner} ${styles.flowerTL}`} />
          <img src="/assets/bungasudutkananatas.png" alt="" className={`${styles.flowerCorner} ${styles.flowerTR}`} />
          <img src="/assets/bungasudutkiribawah.png" alt="" className={`${styles.flowerCorner} ${styles.flowerBL}`} />
          <img src="/assets/bungasudutkananbawah.png" alt="" className={`${styles.flowerCorner} ${styles.flowerBR}`} />

          <div className={styles.coverContent}>
            <div className={styles.coverHeader}>
              <p className={styles.coverTagline}>{tagline}</p>
              <h1 className={styles.coverTitle}>{groomName} <span className={styles.heart}>♥</span> {brideName}</h1>
              <p className={styles.coverDate}>{weddingDateLabel}</p>
              {guestName && <p className={styles.coverGuest}>Kepada Yth: <span>{guestName}</span></p>}
            </div>

            <div className={styles.coverCoupleWrapper}>
              <img src="/assets/mempelai.png" alt="Mempelai" className={styles.coverCoupleImg} />
            </div>

            <button className={styles.coverOpenBtn} onClick={() => setGameState('gender')}>
              Open Invitation
            </button>
          </div>
        </div>
      )}

      {/* 2. CHOOSE CHARACTER */}
      {gameState === 'gender' && (
        <div className={styles.genderScreen}>
          <div className={styles.headerInfo}>
            <p className={styles.tagline}>{tagline}</p>
            <h1 className={styles.mainTitle}>{groomName} <span className={styles.heart}>♥</span> {brideName}</h1>
            <p className={styles.dateText}>{weddingDateLabel}</p>
          </div>

          <div className={styles.characterPreviewArea}>
            <div className={styles.characterCard} onClick={() => { setGender('man'); setGameState('playing'); }}>
              <div className={`${styles.previewSprite} ${styles.manPreview}`} />
              <button className={`${styles.selectCharBtn} ${styles.manSelectBtn}`}>Pilih Pria</button>
            </div>

            <div className={styles.characterCard} onClick={() => { setGender('woman'); setGameState('playing'); }}>
              <div className={`${styles.previewSprite} ${styles.womanPreview}`} />
              <button className={`${styles.selectCharBtn} ${styles.womanSelectBtn}`}>Pilih Wanita</button>
            </div>
          </div>

          <div className={styles.genderDialogCard}>
            <p>Pilih karaktermu untuk menelusuri lokasi acara</p>
          </div>
        </div>
      )}

      {/* 3. GAMEPLAY */}
      {gameState === 'playing' && (
        <div className={styles.gameStage}>
          {/* Header */}
          <div className={styles.headerInfoOverlay}>
            <p className={styles.tagline}>{tagline}</p>
            <h2 className={styles.gameTitle}>{groomName} <span className={styles.heart}>♥</span> {brideName}</h2>
            <p className={styles.dateText}>{weddingDateLabel}</p>
          </div>

          {/* Interactive Pill */}
          {nearbyCheckpoint && (
            <div className={styles.interactivePillWrapper}>
              <button className={styles.interactivePill} onClick={() => setActiveModal(nearbyCheckpoint.id)}>
                <span>{nearbyCheckpoint.npcLabel}</span>
              </button>
            </div>
          )}

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
                    <img
                      src={cp.npcImage}
                      alt={cp.title}
                      className={isVenue ? styles.venueImg : styles.npcImg}
                    />
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
              onTouchStart={() => (walkingStateRef.current.left = true)}
              onTouchEnd={() => (walkingStateRef.current.left = false)}
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
              onTouchStart={() => (walkingStateRef.current.right = true)}
              onTouchEnd={() => (walkingStateRef.current.right = false)}
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* 4. MODALS */}
      {activeModal && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setActiveModal(null)}>✕</button>

            {activeModal === 'rsvp' && (
              <div className={styles.modalBody}>
                <h3>Konfirmasi Kehadiran</h3>
                <p>Silakan konfirmasi kehadiran Anda untuk acara kami:</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (onRsvpSubmit) onRsvpSubmit({ status: 'attending' });
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
                  </select>
                  <button type="submit" className={styles.submitBtn}>Kirim Konfirmasi</button>
                </form>
              </div>
            )}

            {activeModal === 'location' && (
              <div className={styles.modalBody}>
                <h3>Waktu & Lokasi Acara</h3>
                <p><strong>Akad Nikah:</strong> 08.00 WIB</p>
                <p><strong>Resepsi:</strong> 11.00 - Selesai</p>
                <p>Gedung Grand Ballroom, Jakarta</p>
                <button className={styles.submitBtn} onClick={() => window.open('https://maps.google.com', '_blank')}>
                  Buka Peta Google Maps
                </button>
              </div>
            )}

            {activeModal === 'gift' && (
              <div className={styles.modalBody}>
                <h3>Kado Digital & QRIS</h3>
                <p>Bank BCA: <strong>1234567890</strong><br />a.n {brideName}</p>
                <div className={styles.qrisBox}>
                  <p>[ QRIS REKENING DIGITAL ]</p>
                </div>
              </div>
            )}

            {activeModal === 'venue' && (
              <div className={styles.modalBody}>
                <h3>Kamu Telah Tiba!</h3>
                <p>Inilah tempat kami akan merayakan hari bahagia ini bersama.</p>
                <p><strong>{venueName}</strong></p>
                <p>{venueAddress}</p>
                <button className={styles.submitBtn} onClick={() => window.open(venueMapsUrl, '_blank')}>
                  Buka Peta Google Maps
                </button>
              </div>
            )}

            {(activeModal === 'thanks' || activeModal === 'welcome') && (
              <div className={styles.modalBody}>
                <h3>Terima Kasih!</h3>
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