
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Frame, Users, Target, Sparkles, Check, Gem } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-primary font-bold text-xl font-headline"
    >
      <Frame className="w-6 h-6" />
      <span>MirrorNet™</span>
    </Link>
  );
}

const HeroGraphic = () => (
    <div className="relative w-full h-full flex items-center justify-center p-4">
        <Frame className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 text-primary" />
    </div>
);

export default function Home() {
  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Strengthen Relationships",
      description: "Build deeper connections with family and friends through honest, constructive feedback.",
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Identify Blind Spots",
      description: "Uncover how you're perceived by different groups in your life, from work to home.",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Unlock Personal Growth",
      description: "Use actionable insights from your circles to become a better version of yourself.",
    },
  ];

  const premiumFeatures = [
    { text: "Suggest shared goals to family members" },
    { text: "See your anonymous attraction ratings" },
    { text: "Use tokens to reveal secret admirers" },
    { text: "Rate users for attractiveness outside of your circles" },
    { text: "Get a premium badge on your profile" },
  ];

  const faqItems = [
    {
      question: "What is MirrorNet™?",
      answer:
        "MirrorNet™ is a personal development tool designed to help you understand yourself better through the eyes of people you trust. It provides a structured way to receive anonymous, constructive feedback on key personal and professional traits from different groups in your life, such as family, friends, and colleagues.",
    },
    {
      question: "How does it work?",
      answer: (
        <div className="space-y-2">
          <p>The process is simple:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>You join or create private 'circles' for different areas of your life (e.g., 'Work', 'Family').</li>
            <li>You and other members of a circle rate each other on a predefined set of relevant traits.</li>
            <li>The app then aggregates this feedback, showing you your personal average scores for each trait. This allows you to see trends and gain insights into how you're perceived by that circle.</li>
          </ul>
        </div>
      )
    },
    {
      question: "Is my feedback anonymous?",
      answer:
        "Yes, absolutely. For standard circle ratings, your individual scores are never revealed. All feedback is combined and presented as an aggregated average for each trait. For Attraction Ratings, your feedback is anonymous by default. Premium users have the option to attach their identity to an attraction rating they give.",
    },
    {
      question: "Who can see my scores?",
      answer:
        "Only you can see your detailed dashboard and the personal average scores you receive from your private circles (Family, Friends, Work, etc.). Other members of a circle cannot see your personal scores. For the premium Attraction feature, your average scores are also only visible to you. The individual ratings that make up that score remain private and anonymous unless a user accepts a reveal request.",
    },
    {
      question: "What is the Eco Rating?",
      answer:
        "The Eco Rating is a self-assessment feature that helps you reflect on your environmental habits. By answering a series of questions about your lifestyle in areas like energy use, waste management, and transportation, you receive a set of scores from 1 to 10. This provides a private, personal benchmark to understand your environmental impact and identify areas where you can make more sustainable choices. Your Eco Rating is only visible to you.",
    },
     {
      question: "What are the Premium features?",
      answer: (
         <div className="space-y-2">
            <p>Our Premium membership unlocks deeper insights and new ways to connect:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>View Attraction Ratings:</strong> See your average scores on traits like Charm, Witty, and Authenticity from anyone on the platform.</li>
                <li><strong>Use Premium Tokens:</strong> Get tokens monthly to request an identity reveal from an anonymous rater, or to rate someone outside your established circles.</li>
                <li><strong>Suggest Family Goals:</strong> Propose shared 30-day goals to family members to strengthen your connection.</li>
                <li><strong>Premium Badge:</strong> A badge on your profile to show you support the platform.</li>
            </ul>
        </div>
      )
    },
    {
      question: "How is my data protected?",
      answer:
        "We take user privacy and data protection very seriously. Your data is securely stored using Firebase's robust infrastructure. We only collect the necessary information to make the app function, and we do not share your personal data or individual ratings with third parties. All feedback is anonymized and aggregated by default to protect your identity.",
    },
    {
      question: "How can I contact support?",
      answer:
        "For any questions, support issues, or feedback, please email us at mirror@mirrornet.net. We're happy to help!",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Logo />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild>
            <Link href="/dashboard">Go to App</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Discover Your True Reflection
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                    The honest, anonymous feedback platform for personal growth and stronger relationships.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                  <Button size="lg" asChild>
                    <Link href="/dashboard">Explore the Dashboard</Link>
                  </Button>
                </div>
              </div>
              <HeroGraphic />
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <p className="text-primary font-semibold">WHY MIRRORNET™?</p>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">The Feedback You've Been Missing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Go beyond self-perception and see yourself through the eyes of people you know and trust.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-12 py-12 md:grid-cols-3 md:gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="grid justify-items-center gap-4 text-center">
                  <div className="flex justify-center rounded-full bg-background p-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold font-headline">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-primary font-semibold">PREMIUM FEATURES</p>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline mb-6">Unlock Deeper Insights</h2>
                <ul className="space-y-4">
                  {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                        <Check className="w-5 h-5" />
                      </div>
                      <span className="text-lg text-muted-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" asChild className="mt-8">
                  <Link href="/premium">
                    <Gem className="mr-2 h-5 w-5" /> Go Premium
                  </Link>
                </Button>
              </div>
               <div className="order-1 lg:order-2 flex justify-center">
                 <div className="relative p-8 rounded-full bg-secondary">
                    <div className="relative z-10 p-8 rounded-full bg-background shadow-2xl">
                        <Sparkles className="w-24 h-24 text-primary animate-pulse" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>


        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
            <div className="container mx-auto max-w-3xl px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                        Frequently Asked Questions
                    </h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-semibold text-left">
                        {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                        {item.answer}
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Ready to See Your Reflection?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join MirrorNet™ today and start your journey of personal growth.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button size="lg" asChild className="w-full">
                 <Link href="/dashboard">Explore Now</Link>
               </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2025 MirrorNet™. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/terms"
            className="text-xs hover:underline underline-offset-4"
          >
            Terms of Service
          </Link>
           <Link
            href="/public-faq"
            className="text-xs hover:underline underline-offset-4"
          >
            FAQ
          </Link>
        </nav>
      </footer>
    </div>
  );
}
