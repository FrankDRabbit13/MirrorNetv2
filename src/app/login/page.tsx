
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { doc, getDoc } from "firebase/firestore";
import { createNewUserData } from "@/lib/data";
import Image from "next/image";

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.651-3.358-11.303-8H2.59c3.22,10.025,12.723,16,21.41,16z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.508,44,30.028,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
)

export default function LoginPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to login",
        description: "Invalid credentials. Please check your email and password.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const fbUser = userCredential.user;
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await createNewUserData(fbUser);
            toast({ title: "Account Created!", description: "Welcome to MirrorNet™." });
        }
        
        router.push("/dashboard");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email required", description: "Please enter your email address." });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send password reset email.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex justify-center items-center gap-2 mb-4">
            <Image src="https://firebasestorage.googleapis.com/v0/b/mirrornet-96cce.appspot.com/o/MirrorNet%20logo.png?alt=media&token=5fcd3e2f-42a6-46ed-8093-44b0489ba1fd" alt="MirrorNet™ Logo" width={32} height={32} />
             <span className="text-2xl font-bold font-headline text-primary">MirrorNet™</span>
          </Link>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
              <form onSubmit={handleLogin} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button type="button" variant="link" className="ml-auto inline-block text-sm underline p-0 h-auto">
                                Forgot your password?
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Your Password</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Enter your email address below and we'll send you a link to reset your password.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="grid gap-2 py-4">
                                  <Label htmlFor="reset-email">Email</Label>
                                  <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    disabled={isResetting}
                                  />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handlePasswordReset} disabled={isResetting}>
                                  {isResetting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                  Send Reset Email
                                </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : null}
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
              </form>
              <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                      </span>
                  </div>
              </div>
               <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                 <GoogleIcon />
                 <span className="ml-2">Sign in with Google</span>
              </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
