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
  { id: 'welcome', xPos: 350, title: 'Selamat Datang', npcLabel: 'Information', npcImage: '/assets/groom.png' },
  { id: 'location', xPos: 850, title: 'Waktu & Lokasi', npcLabel: 'Venue', npcImage: '/assets/npc-location.png' },
  { id: 'rsvp', xPos: 1350, title: 'Konfirmasi Kehadiran', npcLabel: 'RSVP', npcImage: '/assets/npc-rsvp.png' },
  { id: 'gift', xPos: 1850, title: 'Kado Digital & QRIS', npcLabel: 'Wedding Gift', npcImage: '/assets/groom.png' },
  { id: 'thanks', xPos: 2250, title: 'Terima Kasih', npcLabel: 'Pesan Spesial', npcImage: '/assets/bride.png' },
  { id: 'venue', xPos: 2750, title: 'Lokasi Acara', npcLabel: 'Tempat Acara', npcImage: '/assets/clocktower.png' },
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
      {/* 1. COVER SCREEN TUSCANY REVAMP */}
      {gameState === 'cover' && (
        <div className={styles.cover}>
          
          {/* Layer Ornamen Bunga Melayang (Flower.png) */}
          <img src="/assets/Flower.png" alt="" className={styles.flowerOverlay} />

          {/* Kontainer Utama Teks */}
          <div className={styles.coverContent}>
            
            {/* Header: Tagline, Nama Mempelai, Tanggal */}
            <div className={styles.headerGroup}><br></br>
              <p className={styles.taglineText}>THE WEDDING OF</p><br></br>
              <div className={styles.coupleNamesContainer}>
                    <span className={styles.groomName}>{groomName}</span>
                    <span className={styles.ampersand}>&</span>
                    <span className={styles.brideName}>{brideName}</span>
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
          <img src="/assets/Character.png" alt="Couple Character" className={styles.characterImg} />

          {/* Bingkai Tombol Emas Overlay & Tombol Klik */}
{/* Tombol Open Invitation */}
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
              <span className={styles.charGroom}>{groomName}</span>
              <span className={styles.charAmpersand}>&</span>
              <span className={styles.charBride}>{brideName}</span>
            </div>

            <p className={styles.charDate}>{weddingDateLabel}</p>
          </div>

          {/* Teks Instruksi */}
          <div className={styles.instructionTextGroup}>
            <p className={styles.instructionLine1}>Choose your character</p>
            <p className={styles.instructionLine2}>to discover our wedding details</p>
          </div>

          {/* Area Pilihan Karakter (Man & Woman) */}
          <div className={styles.characterSelectionRow}>
            
            {/* Karakter Pria */}
            <div 
              className={styles.characterBox} 
              onClick={() => { setGender('man'); setGameState('playing'); }}
            >
              <img 
                src="/assets/man character.png" 
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
                src="/assets/woman character.png" 
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
                <p><br></br>Wedding Ceremony: <br></br> <strong>Sunday, 22nd November 2026<br></br>08:00 AM - 09:00 AM</strong><br></br>Wedding Reception:<br></br> <strong>Sunday, 22nd November 2026<br></br>10:00 AM -14:30 PM</strong></p>
                <p>{venueName}</p>
                <button className={styles.submitBtn} onClick={() => window.open('https://www.google.com/maps/place/Balai+Rakyat+Depok+1,+Jl.+Bangau+Raya+No.192-174,+Depok+Jaya,+Pancoran+Mas,+Depok+City,+West+Java+16432/data=!4m2!3m1!1s0x2e69e9508de3b925:0xf1901ae7fbf4d254!18m1!1e1?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI2LjM0LjQYACCenQoqqQEsOTQyNjc3MjcsOTQyOTIxOTUsOTQyOTk1MzIsMTAwNzk2NDk4LDEwMDc5Nzc2MSwxMDA4MjY0NzksMTAwNzk2NTM1LDk0MjgwNTc2LDk0MjA3Mzk0LDk0MjA3NTA2LDk0MjA4NTA2LDk0MjE8NjUzLDk0MjI5ODM5LDk0Mjc1MTY4LDk0Mjc5NjE5LDEwMDgxNTY0MCwxMDA4MjAyMzcsMTAwODIyNDk0QgJJRA%3D%3D&skid=29635fb2-989a-4cea-bba6-90cb3cddad94&g_st=ac', '_blank')}>
                  Buka Peta Google Maps
                </button>
              </div>
            )}

            {activeModal === 'gift' && (
              <div className={styles.modalBody}>
                <h3>Wedding Gift </h3>
                <p>Your presence is more than enough, but if you wish to send us a gift, you may do so via:</p>                
                <div className={styles.qrisBox}>
                  <p>Bank BCA: <strong>6041336878</strong><br />Elrisa Salsabilla</p>
                </div>
                <p> With love and gratitude. </p>
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
                <h3>Thank You, Dear Guests!</h3>
                <p>We look forward to celebrating our special day with you.
It would be an honor and a joy to have you there to share in our happiness and bless our union.
</p>
                <p className={styles.coupleSign}>With love<br></br>The Happy Couple<br></br><strong>Elrisa Salsabilla & Dinar Suherlan</strong></p>
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