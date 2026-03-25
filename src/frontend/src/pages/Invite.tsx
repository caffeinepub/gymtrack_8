import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Check,
  Copy,
  Link,
  Loader2,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAllRSVPs,
  useGenerateInviteCode,
  useInviteCodes,
} from "../hooks/useQueries";

function formatDate(time: bigint) {
  return new Date(Number(time / 1_000_000n)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InvitePage() {
  const {
    data: inviteCodes = [],
    isLoading: codesLoading,
    refetch: refetchCodes,
  } = useInviteCodes();
  const {
    data: rsvps = [],
    isLoading: rsvpsLoading,
    refetch: refetchRSVPs,
  } = useAllRSVPs();
  const generateCode = useGenerateInviteCode();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      await generateCode.mutateAsync();
      toast.success("New invite link generated!");
    } catch {
      toast.error("Failed to generate invite link");
    }
  };

  const handleCopy = (code: string) => {
    const url = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRefresh = () => {
    refetchCodes();
    refetchRSVPs();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Invite Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate invite links and monitor who joins GymTrack
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            data-ocid="invite.secondary_button"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generateCode.isPending}
            data-ocid="invite.primary_button"
          >
            {generateCode.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Generate Invite Link
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Link className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {inviteCodes.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {inviteCodes.filter((c) => c.used).length}
                </p>
                <p className="text-sm text-muted-foreground">Used Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {rsvps.length}
                </p>
                <p className="text-sm text-muted-foreground">Members Joined</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Invite Links
          </CardTitle>
          <CardDescription>
            Share these links with people you want to invite to GymTrack
          </CardDescription>
        </CardHeader>
        <CardContent>
          {codesLoading ? (
            <div
              className="flex items-center justify-center py-8"
              data-ocid="invite.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : inviteCodes.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="invite.empty_state"
            >
              <Link className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No invite links yet. Generate your first one!</p>
            </div>
          ) : (
            <Table data-ocid="invite.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Invite URL</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inviteCodes.map((ic, i) => (
                  <TableRow key={ic.code} data-ocid={`invite.item.${i + 1}`}>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {`${window.location.origin}/invite/${ic.code}`}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(ic.created)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ic.used ? "secondary" : "default"}>
                        {ic.used ? "Used" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(ic.code)}
                        data-ocid={`invite.copy_button.${i + 1}`}
                      >
                        {copiedCode === ic.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* RSVPs / Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members Who Joined
          </CardTitle>
          <CardDescription>
            Track everyone who accepted an invite to your GymTrack group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rsvpsLoading ? (
            <div
              className="flex items-center justify-center py-8"
              data-ocid="invite.rsvp.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : rsvps.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="invite.rsvp.empty_state"
            >
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>
                No members have joined yet. Share an invite link to get started!
              </p>
            </div>
          ) : (
            <Table data-ocid="invite.rsvp.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Invite Code Used</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rsvps.map((rsvp, i) => (
                  <TableRow
                    key={`${rsvp.inviteCode}-${i}`}
                    data-ocid={`invite.rsvp.item.${i + 1}`}
                  >
                    <TableCell className="font-medium">{rsvp.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {rsvp.inviteCode}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(rsvp.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rsvp.attending ? "default" : "secondary"}>
                        {rsvp.attending ? "Joined" : "Declined"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
