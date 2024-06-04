"use client";
import { io } from "socket.io-client";

//@ts-ignore
export const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL);
