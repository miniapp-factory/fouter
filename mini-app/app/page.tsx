import { generateMetadata } from "@/lib/farcaster-embed";
import Game2048 from "@/components/2048-game";

export { generateMetadata };

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <Game2048 />
    </main>
  );
}
