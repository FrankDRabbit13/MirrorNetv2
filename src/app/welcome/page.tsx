"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Frame, Users, Target, Sparkles, Heart } from "lucide-react";
import Image from "next/image";

const onboardingSlides = [
  {
    icon: <Frame className="w-12 h-12 text-primary" />,
    title: "Welcome to MirrorNet™",
    description:
      "The honest, anonymous feedback platform for personal growth and stronger relationships.",
    image: "https://placehold.co/600x400.png",
    imageHint: "welcome abstract",
  },
  {
    icon: <Users className="w-12 h-12 text-primary" />,
    title: "See Yourself Through Others' Eyes",
    description:
      "Invite friends, family, and colleagues to private 'circles' to get anonymous feedback on key traits.",
    image: "https://placehold.co/600x400.png",
    imageHint: "people connection",
  },
  {
    icon: <Target className="w-12 h-12 text-primary" />,
    title: "Identify Your Blind Spots",
    description:
      "Discover how you're perceived in different areas of your life and uncover opportunities for growth.",
    image: "https://placehold.co/600x400.png",
    imageHint: "target growth",
  },
  {
    icon: <Heart className="w-12 h-12 text-primary" />,
    title: "Unlock Deeper Insights",
    description:
      "Go Premium to see your attraction ratings, suggest family goals, and reveal secret admirers.",
    image: "https://placehold.co/600x400.png",
    imageHint: "heart insights",
  },
];

const Sparkle = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute w-2 h-2 bg-primary rounded-full animate-pulse"
    style={style}
  />
);

export default function OnboardingPage() {
  const [sparkles, setSparkles] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const numSparkles = Math.floor(Math.random() * 15) + 10;
      const newSparkles = Array.from({ length: numSparkles }).map((_, i) => {
        const style = {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${Math.random() * 2 + 1}s`,
        };
        return <Sparkle key={i} style={style} />;
      });
      setSparkles(newSparkles);
    };
    generateSparkles();
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {sparkles}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-primary font-bold text-xl font-headline">
        <Frame className="w-6 h-6" />
        <span>MirrorNet™</span>
      </div>
      <div className="w-full max-w-md mx-auto z-10">
        <Carousel className="w-full">
          <CarouselContent>
            {onboardingSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4 aspect-square">
                       <div className="p-4 bg-primary/10 rounded-full">
                         {slide.icon}
                       </div>
                       <h3 className="text-2xl font-semibold font-headline">{slide.title}</h3>
                       <p className="text-muted-foreground">{slide.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
       <div className="absolute bottom-6 w-full max-w-md px-4 z-10">
            <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="w-full">
                    <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                    <Link href="/login">Login</Link>
                </Button>
            </div>
       </div>
    </div>
  );
}
