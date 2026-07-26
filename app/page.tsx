"use client";

import WeddingJourneyInvitation from "./components/WeddingJourneyInvitation";

export default function Home() {
  return (
    <main style={{ background: "#97908a", minHeight: "100vh", padding: "24px 0" }}>
      <WeddingJourneyInvitation
        groomName="Bagas"
        brideName="Ayu"
        guestName="Bapak/Ibu Dedi Kurniawan"
        tagline="The Wedding Of"
        weddingDateISO="2026-06-30T08:00:00+07:00"
        weddingDateLabel="30 Juni 2026"
        openingMessage="Dengan penuh syukur, kami mengundang Bapak/Ibu/Saudara/i untuk berjalan bersama kami menuju hari bahagia ini."
        story={[
          { year: "2019", title: "Perkenalan", text: "Kami bertemu pertama kali di kampus." },
          { year: "2023", title: "Melamar", text: "Bagas melamar Ayu di pinggir danau." },
          { year: "2026", title: "Menikah", text: "Kini saatnya melangkah bersama, selamanya." },
        ]}
        events={[
          {
            name: "Akad Nikah",
            dateLabel: "30 Juni 2026",
            timeLabel: "08.00 - 10.00 WIB",
            venue: "Kediaman Mempelai Wanita",
            address: "Jl. Melati No. 12, Jakarta Selatan",
            mapsUrl: "https://maps.google.com/?q=Jakarta",
          },
          {
            name: "Resepsi",
            dateLabel: "30 Juni 2026",
            timeLabel: "11.00 - 14.00 WIB",
            venue: "Gedung Serbaguna Anggrek",
            address: "Jl. Anggrek No. 5, Jakarta Selatan",
            mapsUrl: "https://maps.google.com/?q=Jakarta",
          },
        ]}
        bankAccounts={[
          { bank: "BCA", accountName: "Bagas Pratama", accountNumber: "1234567890" },
          { bank: "Mandiri", accountName: "Ayu Lestari", accountNumber: "0987654321" },
        ]}
        giftNote="Doa restu adalah hadiah terbaik. Jika ingin memberi tanda kasih, berikut informasinya."
        closingMessage="Terima kasih sudah menjadi bagian dari perjalanan cerita kami."
        onRsvpSubmit={async (data) => {
          console.log("RSVP masuk:", data);
        }}
      />
    </main>
  );
}