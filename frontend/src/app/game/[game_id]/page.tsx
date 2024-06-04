import Board from "./board";
import WebsocketWrapper from "./websocket-wrapper";

export default function Game({
  params: { game_id },
}: {
  params: { game_id: string };
}) {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <WebsocketWrapper gameId={game_id} />
    </div>
  );
}
