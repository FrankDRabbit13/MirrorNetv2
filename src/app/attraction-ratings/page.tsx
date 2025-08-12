
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAttractionScoresForUser, sendRevealRequest, type AttractionRating, attractionTraits, getRevealRequestsForUser, type RevealRequest, updateRevealRequestStatus } from "@/lib/data";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { ChevronLeft, Gem, EyeOff, Heart, HelpCircle, Globe, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function RevealRequestsTable({ requests, loading, onAction }: { requests: RevealRequest[], loading: boolean, onAction: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  const handleAction = async (request: RevealRequest, status: 'accepted' | 'declined') => {
    setIsSubmitting(prev => ({...prev, [request.id]: true}));
    try {
      await updateRevealRequestStatus(request.id, request.ratingId, status);
      toast({ title: `Request ${status === 'accepted' ? 'Accepted' : 'Declined'}`});
      onAction();
    } catch (error) {
      console.error(`Error ${status} reveal request:`, error);
      toast({ variant: "destructive", title: "Error", description: `Failed to ${status} request.`});
    } finally {
      setIsSubmitting(prev => ({...prev, [request.id]: false}));
    }
  }
  
  if (requests.length === 0) return null;

  return (
     <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pending Reveal Requests</CardTitle>
          <CardDescription>
            You gave these users an attraction rating, and they've requested you reveal your identity.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Request From</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {loading ? (
                          <TableRow>
                              <TableCell colSpan={3} className="h-24 text-center">
                                  Loading requests...
                              </TableCell>
                          </TableRow>
                      ) : requests.map((request) => (
                          <TableRow key={request.id}>
                              <TableCell className="font-medium whitespace-nowrap">{request.fromUser?.displayName || 'A user'}</TableCell>
                              <TableCell>Wants to know who gave them an attraction rating.</TableCell>
                              <TableCell className="text-right space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => handleAction(request, 'accepted')} disabled={isSubmitting[request.id]}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Reveal
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleAction(request, 'declined')} disabled={isSubmitting[request.id]}>
                                    <X className="mr-2 h-4 w-4" />
                                    Decline
                                  </Button>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
  );
}

function RatingCard({ rating, onRevealRequest }: { rating: AttractionRating; onRevealRequest: (rating: AttractionRating) => void; }) {
    const { user } = useUser();
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-3">
                     {rating.isAnonymous ? (
                        <div className="flex items-center gap-2 text-muted-foreground italic whitespace-nowrap">
                            <EyeOff className="w-5 h-5" /> 
                            <div className="flex flex-col">
                                <span className="font-semibold text-card-foreground not-italic">Anonymous</span>
                                {rating.isOutOfCircles && <span className="text-xs flex items-center gap-1"><Globe className="w-3 h-3 text-primary" />From outside your circles</span>}
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center gap-3 whitespace-nowrap">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={rating.fromUser?.photoUrl} />
                                <AvatarFallback>{rating.fromUser?.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-card-foreground">{rating.fromUser?.displayName}</span>
                                    {rating.fromUser?.isPremium && <Gem className="w-4 h-4 text-primary" />}
                                </div>
                                {rating.isOutOfCircles && <span className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3 text-primary" />From outside your circles</span>}
                            </div>
                        </div>
                    )}
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {rating.updatedAt?.toDate ? formatDistanceToNow(rating.updatedAt.toDate(), { addSuffix: true }) : ''}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                {attractionTraits.map(trait => (
                    <div key={trait.name} className="flex justify-between items-baseline border-b pb-1">
                        <span className="text-sm text-muted-foreground">{trait.name}</span>
                        <span className="font-bold text-lg text-primary">{rating.ratings[trait.name] || '-'}</span>
                    </div>
                ))}
            </CardContent>
             {rating.isAnonymous && user?.isPremium && (
                <CardContent className="pt-4">
                     {rating.revealRequestStatus === 'pending' && <Badge variant="secondary" className="w-full justify-center">Reveal Requested</Badge>}
                     {rating.revealRequestStatus === 'accepted' && <Badge variant="default" className="w-full justify-center">Revealed</Badge>}
                     {rating.revealRequestStatus === 'declined' && <Badge variant="destructive" className="w-full justify-center">Declined</Badge>}
                     {(!rating.revealRequestStatus || rating.revealRequestStatus === 'none') && (
                         <Button size="sm" onClick={() => onRevealRequest(rating)} disabled={(user.revealTokens || 0) < 1} className="w-full">
                             <HelpCircle className="mr-2 h-4 w-4" />
                             Request Reveal
                         </Button>
                     )}
                </CardContent>
            )}
        </Card>
    )
}

function RatingsListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                         {attractionTraits.map(trait => (
                            <div key={trait.name} className="flex justify-between items-baseline border-b pb-1">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-6 w-6" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function AttractionRatingsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<AttractionRating[]>([]);
  const [revealRequests, setRevealRequests] = useState<RevealRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<AttractionRating | null>(null);

  const fetchData = useCallback(async () => {
    if (user?.isPremium) {
      setLoading(true);
      const [ratingsData, requestsData] = await Promise.all([
          getAttractionScoresForUser(user.id),
          getRevealRequestsForUser(user.id)
      ]);
      
      const sortedRatings = ratingsData.ratings.sort((a, b) => {
          const timeA = a.updatedAt?.seconds || a.createdAt.seconds;
          const timeB = b.updatedAt?.seconds || b.createdAt.seconds;
          return timeB - timeA;
      });
      setRatings(sortedRatings);
      setRevealRequests(requestsData);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.isPremium) {
        router.push('/dashboard');
      }
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user?.isPremium) {
        fetchData();
    }
  }, [user, fetchData]);

  const handleOpenRevealDialog = (rating: AttractionRating) => {
    setSelectedRating(rating);
    setIsAlertOpen(true);
  };

  const handleConfirmReveal = async () => {
     if (!selectedRating || !user) return;

    try {
        await sendRevealRequest(user.id, selectedRating.fromUserId, selectedRating.id);
        toast({
            title: "Request Sent!",
            description: "Your request to reveal the user's identity has been sent."
        });
        fetchData(); // Re-fetch to update the UI
    } catch(error: any) {
        console.error("Error sending reveal request:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to send request.",
        });
    } finally {
        setIsAlertOpen(false);
        setSelectedRating(null);
    }
  };


  if (userLoading || !user?.isPremium) {
    return (
        <div className="space-y-6">
             <Button variant="ghost" asChild>
                <Link href="/dashboard">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
            </Button>
            <RatingsListSkeleton />
        </div>
    )
  }

  return (
    <>
    <div className="space-y-6">
       <Button variant="ghost" asChild>
        <Link href="/dashboard">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <RevealRequestsTable requests={revealRequests} loading={loading} onAction={fetchData} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Attraction Ratings Received
              </CardTitle>
              <CardDescription>
                Here are the ratings you have received from others.
              </CardDescription>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-bold text-lg text-primary">{user.revealTokens || 0}</p>
              <p className="text-xs text-muted-foreground">Reveal Tokens</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {loading ? <RatingsListSkeleton /> : (
                <div className="space-y-4">
                    {ratings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ratings.map(rating => (
                                <RatingCard key={rating.id} rating={rating} onRevealRequest={handleOpenRevealDialog} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10">
                            <p className="text-muted-foreground">No ratings received yet.</p>
                        </div>
                    )}
                </div>
            )}
        </CardContent>
      </Card>
    </div>

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Request Identity Reveal?</AlertDialogTitle>
          <AlertDialogDescription>
            This will use one of your reveal tokens. The user will receive a request and can choose to accept or decline. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmReveal}>
            Confirm & Send Request
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
