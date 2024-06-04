import Board from "./board";
import WebsocketWrapper from "./websocket-wrapper";

export default function Game({
  params: { game_id },
}: {
  params: { game_id: string };
}) {
  const url =
    //process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
    "https://malte-budig.de";
  return (
    <div className="w-full h-full flex justify-center items-center">
      <WebsocketWrapper url={url} gameId={game_id} />
    </div>
  );
}
