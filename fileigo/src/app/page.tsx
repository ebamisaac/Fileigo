import Link from "next/link";
import Image from "next/image";
import { Shield, Search, Cloud, ArrowRight, UploadCloud, FolderOpen, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="fixed top-0 w-full border-b border-border bg-background/90 backdrop-blur-md z-50 transition-all">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logos/combination-mark.png" alt="Fileigo Logo" width={140} height={40} className="object-contain h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">
              Login
            </Link>
            <Link href="/auth/signup" className="text-sm font-medium bg-secondary text-secondary-foreground px-5 py-2 rounded-md hover:bg-secondary/90 transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 min-h-[90vh]">
          <div className="absolute inset-0 bg-surface-container-lowest -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/50 via-background to-background"></div>
          <span className="px-3 py-1.5 text-xs font-semibold bg-primary/5 text-primary rounded-full mb-8 border border-primary/10 shadow-sm">
            The #1 Academic Digital Vault
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold text-foreground max-w-5xl tracking-tight leading-[1.1] mb-8">
            Your Academic Documents, <br className="hidden md:block" /> <span className="text-secondary bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">Secured Forever</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
            Fileigo is a secure cloud-based digital vault designed specifically for students to safely store, organize, and retrieve academic documents anytime, anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/auth/signup" className="inline-flex items-center justify-center h-14 px-8 text-base font-bold text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/25 hover:-translate-y-0.5">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center h-14 px-8 text-base font-bold text-foreground bg-background border-2 border-border rounded-lg hover:bg-muted hover:border-muted-foreground/30 transition-all">
              Learn More
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card border-y border-border/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold mb-6">Everything you need to stay organized</h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">Stop worrying about lost physical documents. Fileigo provides a dedicated, structured environment for all your academic records.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: "Secure Storage", desc: "Enterprise-grade encryption keeps your sensitive receipts, transcripts, and ID slips safe from prying eyes." },
                { icon: Search, title: "Easy Access", desc: "Powerful search functionality lets you find any document in seconds, exactly when you need it." },
                { icon: Cloud, title: "Cloud Backup", desc: "Never lose a document again. Your files are backed up securely in the cloud, protected against physical loss." },
                { icon: Smartphone, title: "Fast Retrieval", desc: "Access your digital vault from your phone or laptop. Download or print documents instantly during school processes." }
              ].map((feature, i) => (
                <div key={i} className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-heading text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold mb-6">How it works</h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">Three simple steps to secure your academic future.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-border via-primary/20 to-border -z-10"></div>
              
              {[
                { icon: UploadCloud, step: "1", title: "Upload", desc: "Snap a photo or upload a PDF of your receipt, clearance form, or transcript." },
                { icon: FolderOpen, step: "2", title: "Organize", desc: "Categorize your files into dedicated folders for easy management." },
                { icon: Search, step: "3", title: "Access Anytime", desc: "Retrieve, download, or print your documents whenever you need them." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-card border-[8px] border-background shadow-lg rounded-full flex items-center justify-center mb-8 relative">
                    <item.icon className="w-12 h-12 text-secondary" />
                    <span className="absolute -top-1 -right-1 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg border-4 border-background shadow-sm">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-heading text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-lg px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center mb-6">
                <Image src="/logos/combination-mark.png" alt="Fileigo Logo" width={140} height={40} className="object-contain h-8 w-auto" />
              </Link>
              <p className="text-muted-foreground text-base max-w-md mb-8 leading-relaxed">
                The dedicated, secure, student-focused document repository. Store, organize, and access your academic credentials safely and seamlessly.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-foreground font-heading">Product</h4>
              <ul className="space-y-4 text-base text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How it works</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-foreground font-heading">Legal</h4>
              <ul className="space-y-4 text-base text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Fileigo. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="font-medium bg-muted px-3 py-1 rounded-full text-xs">Built for students</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
