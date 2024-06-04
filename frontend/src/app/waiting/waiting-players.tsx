"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function WaitingPlayers({ url }: { url: string }) {
  //@ts-ignore
  const [waitingPlayers, setWaitingPlayers] = useState<string[]>([]);
  const [openMatchFoundDialog, setOpenMatchFoundDialog] = useState(false);
  const [game, setGame] = useState({ game_id: "" });
  const router = useRouter();

  useEffect(() => {
    const socket = io(url);
    socket.emit("waiting");
    console.log(process.env.NEXT_PUBLIC_WEBSOCKET_URL);

    // Listen for incoming messages
    socket.on(
      "waiting players",
      ({ waitingPlayers }: { waitingPlayers: string[] }) => {
        // Add type annotation for waitingPlayers parameter
        console.log(waitingPlayers);
        setWaitingPlayers(waitingPlayers);
      },
    );

    socket.on("match found", ({ game_id }: { game_id: string }) => {
      setOpenMatchFoundDialog(true);
      setGame({ game_id });
      console.log("Match found");
    });
  }, []);

  return (
    <div>
      <h1>Real-Time Chat</h1>
      <Dialog
        open={openMatchFoundDialog}
        onOpenChange={setOpenMatchFoundDialog}
      >
        <DialogContent>
          <p>Match Found</p>
          <p>Game ID: {game.game_id}</p>
          <Button onClick={() => router.push(`/game/${game.game_id}`)}>
            Go to Game
          </Button>
        </DialogContent>
      </Dialog>
      <div>
        {waitingPlayers.map((player, index) => (
          <div key={index}>{player}</div>
        ))}
      </div>
    </div>
  );
}
