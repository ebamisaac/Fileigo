import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-surface-container-lowest -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/50 via-background to-background"></div>
      
      <div className="w-full max-w-md mb-8 flex justify-center">
        <Link href="/">
          <Image src="/logos/combination-mark.png" alt="Fileigo Logo" width={180} height={50} className="object-contain h-10 w-auto" />
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
