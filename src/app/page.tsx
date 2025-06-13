
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, Search, MessageSquareHeart, ShieldCheck, Activity, Users, HeartPulse } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <BedDouble className="h-10 w-10 text-primary" />,
      title: 'Real-Time Bed Availability',
      description: 'Live updates on ICU, oxygen, ventilator, and general beds.',
    },
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: 'Hospital Search & Booking',
      description: 'Find nearby hospitals, filter by specialty, and reserve beds.',
    },
    {
      icon: <Activity className="h-10 w-10 text-primary" />,
      title: 'Smart Recommendations',
      description: 'AI-powered suggestions for the best hospitals based on your needs.',
    },
    {
      icon: <MessageSquareHeart className="h-10 w-10 text-primary" />,
      title: 'Feedback & Complaints',
      description: 'Share your experiences and help improve healthcare services.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <HeartPulse className="h-24 w-24 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 text-primary-foreground bg-primary py-2 px-4 rounded-md inline-block shadow-md">
            Welcome to HospConnect
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-3xl mx-auto">
            Connecting you to the right hospital, right when you need it.
            Find real-time bed availability, search for specialized care, and book appointments seamlessly.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/search">
                <Search className="mr-2 h-5 w-5" /> Find a Hospital
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/register?role=hospital">Register Your Hospital</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12 text-primary">
            Our Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-card rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12 text-primary">
            Why Choose HospConnect?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6">
              <ShieldCheck className="h-16 w-16 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-headline">Reliable & Secure</h3>
              <p className="text-muted-foreground">
                Trusted information and secure data handling for peace of mind.
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <Users className="h-16 w-16 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-headline">Patient-Centric</h3>
              <p className="text-muted-foreground">
                Designed with your needs first, ensuring easy access to care.
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <BedDouble className="h-16 w-16 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-headline">Comprehensive Data</h3>
              <p className="text-muted-foreground">
                Up-to-date bed availability and hospital facility information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
       <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12 text-primary">
            Connecting Care, Improving Lives
          </h2>
          <div className="aspect-[16/9] w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl">
            <Image
              src="/img_hospital.jpg"
              alt="Hospital image representing HospConnect services"
              width={1200}
              height={675}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
