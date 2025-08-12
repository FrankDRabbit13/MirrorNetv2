
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link as LinkIcon } from "lucide-react";
import copy from "copy-to-clipboard";

export default function InvitePage() {
  const { toast } = useToast();
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    // Generate the generic invite link on the client side
    const link = `${window.location.origin}/signup`;
    setInviteLink(link);
  }, []);
  
  const handleCopy = () => {
    copy(inviteLink);
    toast({ title: "Copied to clipboard!", description: "The invite link has been copied." });
  };

  return (
    <>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Invite New Members
          </h1>
          <p className="text-muted-foreground">
            Get new people on the platform by sharing an invite link.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Share an Invite Link</CardTitle>
            <CardDescription>
              Copy this link and send it to anyone. After they sign up, you can find them using the search page to add them to your circles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                <Input value={inviteLink} readOnly className="flex-1" />
                 <Button onClick={handleCopy} disabled={!inviteLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
