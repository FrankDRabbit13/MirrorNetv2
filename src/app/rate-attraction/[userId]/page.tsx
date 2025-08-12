
"use client";

import { useState, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserById, type User, attractionTraits, isUserInCircles } from "@/lib/data";
import { notFound, useRouter, useParams } from "next/navigation";
import { ChevronLeft, Send, Gem } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { collection, serverTimestamp, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function RateAttractionPage() {
  const params = useParams();
  const userId = params.userId as string;

  const { user: currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [userToRate, setUserToRate] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [revealIdentity, setRevealIdentity] = useState(false);
  const [isInCircles, setIsInCircles] = useState(true);
  const [useToken, setUseToken] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
      const [fetchedUser, userInCircles] = await Promise.all([
          getUserById(userId),
          isUserInCircles(currentUser.id, userId)
      ]);

      if (fetchedUser) {
        setUserToRate(fetchedUser);
        setIsInCircles(userInCircles);
        if (!userInCircles) {
            setUseToken(true); // Default to using a token if not in circles
        }
        const initialRatings = attractionTraits.reduce((acc, trait) => {
          acc[trait.name] = 5;
          return acc;
        }, {} as Record<string, number>);
        setRatings(initialRatings);
      } else {
        notFound();
      }
      setLoading(false);
    };
    if (currentUser) {
        fetchData();
    }
  }, [userId, currentUser]);

  const handleRatingChange = (traitName: string, value: number[]) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [traitName]: value[0],
    }));
  };
  
  const handleSubmit = async () => {
    if (!currentUser || !userToRate) {
      toast({ variant: "destructive", title: "Error", description: "Could not submit rating. Missing user information." });
      return;
    }

    const needsToken = !isInCircles && useToken;
    if (needsToken && (currentUser.revealTokens || 0) < 1) {
      toast({ variant: "destructive", title: "No Tokens Left", description: "You need a token to rate users outside your circles." });
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Decrement token if needed
      if (needsToken) {
          const userRef = doc(db, 'users', currentUser.id);
          batch.update(userRef, { revealTokens: (currentUser.revealTokens || 0) - 1 });
      }

      // 2. Upsert the rating
      const ratingsRef = collection(db, "attractionRatings");
      const q = query(ratingsRef,
        where("fromUserId", "==", currentUser.id),
        where("toUserId", "==", userToRate.id)
      );
      const querySnapshot = await getDocs(q);

      const ratingPayload = {
        fromUserId: currentUser.id,
        toUserId: userToRate.id,
        ratings: ratings,
        isAnonymous: !(currentUser.isPremium && revealIdentity),
        isOutOfCircles: !isInCircles,
        updatedAt: serverTimestamp(),
      };

      if (querySnapshot.empty) {
        const newRatingRef = doc(ratingsRef);
        batch.set(newRatingRef, { ...ratingPayload, createdAt: serverTimestamp() });
      } else {
        const existingRatingDoc = querySnapshot.docs[0];
        batch.update(existingRatingDoc.ref, ratingPayload);
      }

      await batch.commit();

      toast({
        title: "Rating Submitted!",
        description: `Your attraction rating for ${userToRate.displayName} has been recorded.`,
      });

      router.back();

    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to submit rating. Please try again."});
    } finally {
        setIsSubmitting(false);
    }
  };


  if (loading || !userToRate || !currentUser) {
    return <div>Loading...</div>
  }

  const canSubmit = useToken || isInCircles;
  const submitButtonDisabled = isSubmitting || !canSubmit || (!isInCircles && useToken && (currentUser.revealTokens || 0) < 1);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" asChild>
        <Link href="#" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userToRate.photoUrl} alt={userToRate.displayName} />
              <AvatarFallback>{userToRate.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-headline">Rate {userToRate.displayName}</CardTitle>
              <CardDescription>
                Rate this user on the following attraction traits from 1 to 10.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
          {attractionTraits.map((trait) => (
            <div key={trait.name} className="grid gap-2">
              <div className="flex justify-between items-center">
                <div>
                    <Label htmlFor={trait.name} className="text-base font-medium">
                      {trait.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{trait.definition}</p>
                </div>
                <span className="font-bold text-lg text-primary w-10 text-center">
                  {ratings[trait.name]}
                </span>
              </div>
              <Slider
                id={trait.name}
                value={[ratings[trait.name] || 5]}
                onValueChange={(value) => handleRatingChange(trait.name, value)}
                min={1}
                max={10}
                step={1}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
             {!isInCircles && currentUser.isPremium && (
                <div className="flex items-center space-x-2 w-full justify-start p-4 bg-secondary rounded-md">
                    <Gem className="w-4 h-4 text-primary" />
                    <Label htmlFor="use-token" className="text-sm font-medium">Use 1 token to rate this user (not in your circles)</Label>
                    <Switch 
                        id="use-token"
                        checked={useToken}
                        onCheckedChange={setUseToken}
                        disabled={isSubmitting}
                    />
                    <Badge variant="outline" className="ml-auto">
                        {currentUser.revealTokens || 0} tokens left
                    </Badge>
                </div>
            )}

            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                 {currentUser?.isPremium ? (
                    <div className="flex items-center space-x-2 self-start sm:self-center">
                        <Gem className="w-4 h-4 text-primary" />
                        <Label htmlFor="reveal-identity" className="text-sm font-medium">Reveal my identity with this rating</Label>
                        <Switch 
                            id="reveal-identity"
                            checked={revealIdentity}
                            onCheckedChange={setRevealIdentity}
                            disabled={isSubmitting}
                        />
                    </div>
                ) : <div />}

                <Button onClick={handleSubmit} disabled={submitButtonDisabled}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit Rating"}
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
