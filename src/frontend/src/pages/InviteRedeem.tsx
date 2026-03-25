import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "@tanstack/react-router";
import { CheckCircle, Dumbbell, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSubmitRSVP } from "../hooks/useQueries";

export default function InviteRedeemPage() {
  const params = useParams({ strict: false }) as { code?: string };
  const code = params.code ?? "";
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitRSVP = useSubmitRSVP();
  const { login, isLoggingIn } = useInternetIdentity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await submitRSVP.mutateAsync({
        name: name.trim(),
        attending: true,
        inviteCode: code,
      });
      setSubmitted(true);
      toast.success("Welcome to GymTrack!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0f3a8a 0%, #1E73E8 60%, #5ba3f5 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">GymTrack</h1>
          <p className="text-white/70 mt-1">Your fitness journey starts here</p>
        </div>

        <Card className="shadow-2xl">
          {!submitted ? (
            <>
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  You&apos;ve been invited!
                </CardTitle>
                <CardDescription>
                  You&apos;ve been invited to join GymTrack. Enter your name
                  below to accept and get access to daily workouts, exercise
                  tracking, and health monitoring.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      data-ocid="invite.redeem.input"
                    />
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
                    <p>
                      <strong>Invite code:</strong>{" "}
                      <code className="font-mono">{code}</code>
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitRSVP.isPending || !name.trim()}
                    data-ocid="invite.redeem.submit_button"
                  >
                    {submitRSVP.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Join GymTrack
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">
                  Welcome to GymTrack! 🎉
                </CardTitle>
                <CardDescription>
                  Hi <strong>{name}</strong>! Your membership has been
                  confirmed. Log in now to access your daily workouts, track
                  your progress, and start your fitness journey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="invite.redeem.login_button"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Dumbbell className="w-4 h-4 mr-2" />
                  )}
                  Log In to GymTrack
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
