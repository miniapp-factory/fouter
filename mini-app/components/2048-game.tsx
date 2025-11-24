"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const SIZE = 4;

function randomTile() {
  return Math.random() < 0.9 ? 2 : 4;
}

function initBoard() {
  const board = Array.from({ length: SIZE * SIZE }, () => 0);
  addRandomTile(board);
  addRandomTile(board);
  return board;
}

function addRandomTile(board: number[]) {
  const empty = board
    .map((v, i) => (v === 0 ? i : -1))
    .filter((i) => i !== -1);
  if (empty.length === 0) return;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  board[idx] = randomTile();
}

function move(
  board: number[],
  dir: "up" | "down" | "left" | "right"
) {
  let moved = false;
  const newBoard = [...board];
  const range = [...Array(SIZE).keys()];

  const iterate = (indices: number[]) => {
    const line = indices.map((i) => newBoard[i]);
    const filtered = line.filter((v) => v !== 0);
    const merged: number[] = [];
    let skip = false;
    for (let i = 0; i < filtered.length; i++) {
      if (skip) {
        skip = false;
        continue;
      }
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        merged.push(filtered[i] * 2);
        skip = true;
      } else {
        merged.push(filtered[i]);
      }
    }
    while (merged.length < SIZE) merged.push(0);
    for (let i = 0; i < SIZE; i++) {
      if (newBoard[indices[i]] !== merged[i]) moved = true;
      newBoard[indices[i]] = merged[i];
    }
  };

  if (dir === "left") {
    for (let r = 0; r < SIZE; r++)
      iterate(range.map((c) => r * SIZE + c));
  } else if (dir === "right") {
    for (let r = 0; r < SIZE; r++)
      iterate(range.map((c) => r * SIZE + (SIZE - 1 - c)));
  } else if (dir === "up") {
    for (let c = 0; c < SIZE; c++)
      iterate(range.map((r) => r * SIZE + c));
  } else if (dir === "down") {
    for (let c = 0; c < SIZE; c++)
      iterate(range.map((r) => (SIZE - 1 - r) * SIZE + c));
  }

  return { board: newBoard, moved };
}

function hasMoves(board: number[]) {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === 0) return true;
    const r = Math.floor(i / SIZE);
    const c = i % SIZE;
    const neighbors = [
      r > 0 ? board[(r - 1) * SIZE + c] : null,
      r < SIZE - 1 ? board[(r + 1) * SIZE + c] : null,
      c > 0 ? board[r * SIZE + (c - 1)] : null,
      c < SIZE - 1 ? board[r * SIZE + (c + 1)] : null,
    ];
    if (neighbors.some((v) => v === board[i])) return true;
  }
  return false;
}

function getTileClass(value: number) {
  if (value === 0) return "bg-gray-800 text-gray-800";
  if (value <= 4) return "bg-gray-200 text-black";
  if (value <= 8) return "bg-gray-300 text-black";
  if (value <= 16) return "bg-gray-400 text-black";
  if (value <= 32) return "bg-gray-500 text-black";
  if (value <= 64) return "bg-gray-600 text-white";
  if (value <= 128) return "bg-gray-700 text-white";
  if (value <= 256) return "bg-gray-800 text-white";
  if (value <= 512) return "bg-gray-900 text-white";
  return "bg-gray-950 text-white";
}

export default function Game2048() {
  const [board, setBoard] = useState<number[]>(initBoard);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    const { board: newBoard, moved } = move(board, dir);
    if (!moved) return;
    const addedScore = newBoard.reduce((s, v) => s + v, 0) - board.reduce((s, v) => s + v, 0);
    setScore(score + addedScore);
    setBoard(newBoard);
    addRandomTile(newBoard);
    setBoard([...newBoard]);
    if (newBoard.includes(2048)) setWon(true);
    if (!hasMoves(newBoard)) setGameOver(true);
  };

  const handleKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        handleMove("up");
        break;
      case "ArrowDown":
        handleMove("down");
        break;
      case "ArrowLeft":
        handleMove("left");
        break;
      case "ArrowRight":
        handleMove("right");
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [board, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex justify-between w-full">
        <span className="text-xl font-bold">2048</span>
        <span className="text-xl font-bold">{score}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {board.map((v, i) => (
          <div
            key={i}
            className={`flex items-center justify-center h-16 rounded-md text-2xl font-bold ${getTileClass(v)}`}
          >
            {v || ""}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => handleMove("up")}>↑</Button>
        <Button onClick={() => handleMove("left")}>←</Button>
        <Button onClick={() => handleMove("right")}>→</Button>
        <Button onClick={() => handleMove("down")}>↓</Button>
      </div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold">
            {won ? "You won!" : "Game Over"}
          </span>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
