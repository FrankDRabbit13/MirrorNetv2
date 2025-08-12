
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ecoQuestions, type Question } from "@/lib/eco-questions";
import { type TraitScore } from "@/lib/data";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Leaf, Calculator } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function calculateScore(category: Question[], answers: Record<string, string>): number {
  const maxCategoryPoints = category.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0);
  const userCategoryPoints = category.reduce((sum, q) => {
    const answerValue = answers[q.id] ? parseInt(answers[q.id], 10) : 0;
    return sum + answerValue;
  }, 0);

  // Normalize score to a 1-10 scale.
  // Formula: 1 + 9 * (user_points / max_points)
  if (maxCategoryPoints === 0) return 1;
  const score = 1 + 9 * (userCategoryPoints / maxCategoryPoints);
  return Math.round(score * 10) / 10; // Round to one decimal place
}

export default function EcoRatingPage() {
  const { user, updateUser, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.ecoScores) {
        // If the user has scores, we can't reverse-engineer the answers,
        // but we can pre-fill the form with default "middle" answers
        // if they want to retake it.
        const defaultAnswers = Object.values(ecoQuestions).flat().reduce((acc, q) => {
            const middleOption = q.options[Math.floor(q.options.length / 2)];
            acc[q.id] = String(middleOption.value);
            return acc;
        }, {} as Record<string, string>);
        setAnswers(defaultAnswers);
    } else {
        // New user, set default answers
         const defaultAnswers = Object.values(ecoQuestions).flat().reduce((acc, q) => {
            acc[q.id] = String(q.options[0].value); // Default to the first option
            return acc;
        }, {} as Record<string, string>);
        setAnswers(defaultAnswers);
    }
  }, [user]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to submit." });
      return;
    }

    setIsSubmitting(true);
    try {
      const ecoScores: TraitScore[] = Object.entries(ecoQuestions).map(([categoryName, questions]) => ({
        name: categoryName,
        averageScore: calculateScore(questions, answers),
      }));
      
      await updateUser({ ecoScores });

      toast({
        title: "Eco Rating Updated!",
        description: `Your eco-profile has been successfully updated.`,
      });

      router.push(`/dashboard`);

    } catch (error) {
      console.error("Error submitting eco rating:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to submit your rating. Please try again."});
    } finally {
        setIsSubmitting(false);
    }
  };


  if (userLoading || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" asChild>
        <Link href="/dashboard">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Leaf className="h-12 w-12 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Eco Rating Assessment</CardTitle>
              <CardDescription>
                Answer the questions below to assess your environmental impact. Your answers will be used to calculate your score in five key areas.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={Object.keys(ecoQuestions)} className="w-full">
                {Object.entries(ecoQuestions).map(([categoryName, questions]) => (
                    <AccordionItem key={categoryName} value={categoryName}>
                        <AccordionTrigger className="text-xl font-semibold">
                            {categoryName}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                            {questions.map((q) => (
                                <div key={q.id} className="grid gap-3">
                                    <Label className="text-base">{q.text}</Label>
                                    <RadioGroup
                                        value={answers[q.id]}
                                        onValueChange={(value) => handleAnswerChange(q.id, value)}
                                        className="gap-2"
                                        disabled={isSubmitting}
                                    >
                                        {q.options.map((opt) => (
                                            <div key={opt.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={String(opt.value)} id={`${q.id}-${opt.value}`} />
                                                <Label htmlFor={`${q.id}-${opt.value}`} className="font-normal">{opt.text}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            <Calculator className="mr-2 h-4 w-4" />
            {isSubmitting ? "Calculating & Saving..." : "Calculate My Eco Rating"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
