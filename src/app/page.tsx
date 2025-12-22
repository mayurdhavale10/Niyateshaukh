import SpaceBackground from '@/components/SpaceBackground';
import Navbar from '@/components/Navbar';
import NiyatVideoShayari from '@/components/NiyatVideoShayari';
import Gallery from '@/components/gallery';
import MehfilGallery from '@/components/mehfil';
import Ticket from '@/components/Ticket';

export default function Home() {
  return (
    <main>
      <Navbar />
      <SpaceBackground />
      <NiyatVideoShayari />
      <Gallery />
      <MehfilGallery />
      <Ticket />
    </main>
  );
}