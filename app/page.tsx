import WeddingJourneyInvitation from './components/WeddingJourneyInvitation';

// 1. Tambahkan kata 'async' di depan function dan perbarui tipe datanya menjadi Promise
export default async function Home({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  
  // 2. "Tunggu" dan buka isi parameter menggunakan 'await'
  const params = await searchParams;
  
  // 3. Tangkap nilainya dengan aman
  const guestNameFromUrl = params.to || 'Tamu Undangan';

  return (
    <main style={{ minHeight: '100vh', background: '#efe6dd' }}>
      <WeddingJourneyInvitation guestName={guestNameFromUrl} />
    </main>
  );
}