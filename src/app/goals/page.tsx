
"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/hooks/use-user";
import { getActiveAndCompletedGoals, getFamilyGoalsForUser, getSentFamilyGoalsForUser, updateFamilyGoalStatus, type FamilyGoal } from "@/lib/data";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDistanceToNow, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeartHandshake, Users, Check, X, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


function GoalCard({ goal }: { goal: FamilyGoal }) {
    const { user } = useUser();
    const isSender = user?.id === goal.fromUserId;
    const partner = isSender ? goal.toUser : goal.fromUser;
    
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Goal: {goal.trait}</CardTitle>
                        <CardDescription>
                            A shared goal with {partner?.displayName || 'a family member'}.
                        </CardDescription>
                    </div>
                     <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>{goal.status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center space-x-4">
                    <div className="flex flex-col items-center gap-1">
                        <Avatar>
                            <AvatarImage src={user?.photoUrl} />
                            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">You</span>
                    </div>
                    <HeartHandshake className="text-muted-foreground w-6 h-6" />
                     <div className="flex flex-col items-center gap-1">
                        <Avatar>
                            <AvatarImage src={partner?.photoUrl} />
                            <AvatarFallback>{partner?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{partner?.displayName}</span>
                    </div>
                </div>
            </CardContent>
            <CardContent className="flex-grow">
             {goal.endDate && (
                <p className="text-center text-sm text-muted-foreground pt-4">
                   Ends {formatDistanceToNow(goal.endDate.toDate(), { addSuffix: true })} on {format(goal.endDate.toDate(), 'PPP')}
                </p>
             )}
            </CardContent>
            {goal.tip && goal.status === 'active' && (
                <CardContent>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="tip">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <Lightbulb className="w-4 h-4 text-primary" />
                                  Actionable Tip
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-sm">
                                {goal.tip}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            )}
        </Card>
    )
}

function PendingGoalsTable({ goals, loading, onAction }: { goals: FamilyGoal[], loading: boolean, onAction: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  const handleAction = async (goal: FamilyGoal, status: 'active' | 'declined') => {
    setIsSubmitting(prev => ({...prev, [goal.id]: true}));
    try {
      await updateFamilyGoalStatus(goal.id, status, goal.trait);
      toast({ title: `Goal suggestion ${status === 'active' ? 'accepted' : 'declined'}`});
      onAction();
    } catch (error) {
      console.error(`Error handling goal suggestion:`, error);
      toast({ variant: "destructive", title: "Error", description: `Failed to update suggestion.`});
    } finally {
      setIsSubmitting(prev => ({...prev, [goal.id]: false}));
    }
  }

  if (loading) {
     return <p className="text-muted-foreground">Loading suggestions...</p>
  }
  
  if (goals.length === 0) {
      return null; // Don't render the card if there are no pending goals
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle>Pending Goal Suggestions</CardTitle>
          <CardDescription>
            A family member has suggested a shared goal for you to work on together.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Suggested By</TableHead>
                        <TableHead>Suggested Goal</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {goals.map((goal) => (
                        <TableRow key={goal.id}>
                            <TableCell className="font-medium">{goal.fromUser?.displayName || 'A family member'}</TableCell>
                            <TableCell>Focus on: <span className="font-semibold">{goal.trait}</span></TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleAction(goal, 'active')} disabled={isSubmitting[goal.id]}>
                                    <Check className="mr-2 h-4 w-4"/>
                                    Accept
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleAction(goal, 'declined')} disabled={isSubmitting[goal.id]}>
                                    <X className="mr-2 h-4 w-4"/>
                                    Decline
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
  );
}

function SentGoalsTable({ goals, loading }: { goals: FamilyGoal[], loading: boolean }) {
  if (goals.length === 0) {
    return null;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Pending Suggestions</CardTitle>
        <CardDescription>
          You've sent these goal suggestions and are waiting for a response.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sent To</TableHead>
              <TableHead>Suggested Goal</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Loading suggestions...
                </TableCell>
              </TableRow>
            ) : (
              goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell className="font-medium">
                    {goal.toUser?.displayName || 'A family member'}
                  </TableCell>
                  <TableCell>
                    Focus on: <span className="font-semibold">{goal.trait}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{goal.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


export default function GoalsPage() {
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [activeGoals, setActiveGoals] = useState<FamilyGoal[]>([]);
    const [pendingGoals, setPendingGoals] = useState<FamilyGoal[]>([]);
    const [sentGoals, setSentGoals] = useState<FamilyGoal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const [fetchedActiveGoals, fetchedPendingGoals, fetchedSentGoals] = await Promise.all([
                    getActiveAndCompletedGoals(user.id),
                    getFamilyGoalsForUser(user.id),
                    user.isPremium ? getSentFamilyGoalsForUser(user.id) : Promise.resolve([]),
                ]);
                setActiveGoals(fetchedActiveGoals);
                setPendingGoals(fetchedPendingGoals);
                setSentGoals(fetchedSentGoals);
            } catch (error) {
                console.error("Error fetching goals:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load your goals data."
                })
            } finally {
                setLoading(false);
            }
        }
    }, [user, toast]);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchAllData();
        }
    }, [user, userLoading, router, fetchAllData]);

    if (loading || userLoading || !user) {
        return <div>Loading goals...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                My Family Goals
                </h1>
                <p className="text-muted-foreground">
                Respond to suggestions and track your shared goals with family members.
                </p>
            </div>

            <PendingGoalsTable 
                goals={pendingGoals}
                loading={loading}
                onAction={fetchAllData}
            />

            {user.isPremium && (
                 <SentGoalsTable 
                    goals={sentGoals}
                    loading={loading}
                />
            )}


            {activeGoals.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activeGoals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} />
                    ))}
                </div>
            ) : (
                 <Card className="text-center py-12">
                    <CardContent className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No Active Goals Yet</h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            When you or a family member accept a goal suggestion, it will appear here. You can suggest a goal from the Family circle page.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

    