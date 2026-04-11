"use client";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { DraggableItem } from "@/components/draggable-item";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/scrapebooks/")({
  component: ScrapebooksPage,
});

interface PageItem {
  id: string;
  type: "text" | "image" | "audio";
  content: string;
  x: number;
  y: number;
}

interface Page {
  id: string;
  title: string;
  items: PageItem[];
}

interface Scrapbook {
  id: string;
  title: string;
  pages: Page[];
}

const variants = {
  initial: { rotateY: 0, scale: 1 },
  open: { rotateY: 180, scale: 1.05 },
  exit: { rotateY: 0, scale: 1 },
};

const STORAGE_KEY = "mementoria:scrapebooks";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
];
const ALLOWED_FILE_TYPES = new Set([
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_AUDIO_TYPES,
]);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

// Page flip animation variants
const pageFlipVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    rotateY: direction > 0 ? -90 : 90,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    x: 0,
    rotateY: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    rotateY: direction < 0 ? 90 : -90,
    opacity: 0,
    scale: 0.8,
  }),
};

export default function ScrapebooksPage() {
  const [books, setBooks] = useState<Scrapbook[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [openBook, setOpenBook] = useState<Scrapbook | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [newText, setNewText] = useState("");
  const [pageInput, setPageInput] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBooks(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        toast.error(
          "Your scrapbook data was corrupted and could not be loaded. Starting fresh.",
        );
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = () => {
    if (!newTitle.trim()) return;
    const newBook: Scrapbook = {
      id: uuidv4(),
      title: newTitle.trim(),
      pages: [
        {
          id: uuidv4(),
          title: "Page 1",
          items: [],
        },
      ],
    };
    setBooks([...books, newBook]);
    setNewTitle("");
  };

  const updateBook = (updated: Scrapbook) => {
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setOpenBook(updated);
  };

  const addTextToPage = () => {
    if (!openBook || !newText.trim()) return;
    const updated = { ...openBook };
    const newItem: PageItem = {
      id: uuidv4(),
      type: "text",
      content: newText,
      x: 50,
      y: 50,
    };
    updated.pages[currentPageIndex].items.push(newItem);
    updateBook(updated);
    setNewText("");
  };

  const addFileToPage = async (file: File) => {
    if (!openBook) return;

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      toast.error(
        "Unsupported file type. Please upload an image (JPEG, PNG, GIF, WebP) or audio file (MP3, WAV, OGG).",
      );
      return;
    }

    setIsUploadingFile(true);
    try {
      const url = await readFileAsDataUrl(file);
      const type = ALLOWED_IMAGE_TYPES.includes(file.type) ? "image" : "audio";
      const newItem: PageItem = {
        id: uuidv4(),
        type,
        content: url,
        x: 50,
        y: 50,
      };
      const updated = { ...openBook };
      updated.pages[currentPageIndex].items.push(newItem);
      updateBook(updated);
    } catch {
      toast.error("Failed to read file. Please try again.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDrag = (id: string, x: number, y: number) => {
    if (!openBook) return;
    const updated = { ...openBook };
    const item = updated.pages[currentPageIndex].items.find((i) => i.id === id);
    if (item) {
      item.x = x;
      item.y = y;
      updateBook(updated);
    }
  };

  const goToPage = (newPageIndex: number) => {
    if (isFlipping || newPageIndex === currentPageIndex) return;

    // Ensure the page exists before navigating to it
    if (openBook && newPageIndex >= openBook.pages.length) {
      const updated = { ...openBook };
      while (updated.pages.length <= newPageIndex) {
        updated.pages.push({
          id: uuidv4(),
          title: `Page ${updated.pages.length + 1}`,
          items: [],
        });
      }
      updateBook(updated);
    }

    setIsFlipping(true);
    setDirection(newPageIndex > currentPageIndex ? 1 : -1);

    setTimeout(() => {
      setCurrentPageIndex(newPageIndex);
      setPageInput(newPageIndex + 1);
      setIsFlipping(false);
    }, 300);
  };

  const nextPage = () => {
    if (!openBook || isFlipping) return;

    if (currentPageIndex + 1 >= openBook.pages.length) {
      const updated = { ...openBook };
      updated.pages.push({
        id: uuidv4(),
        title: `Page ${updated.pages.length + 1}`,
        items: [],
      });
      updateBook(updated);
    }
    goToPage(currentPageIndex + 1);
  };

  const previousPage = () => {
    if (isFlipping) return;
    goToPage(Math.max(0, currentPageIndex - 1));
  };

  const addNewPage = () => {
    if (!openBook || isFlipping) return;

    const updated = { ...openBook };
    updated.pages.push({
      id: uuidv4(),
      title: `Page ${updated.pages.length + 1}`,
      items: [],
    });
    updateBook(updated);
    goToPage(updated.pages.length - 1);
  };

  return (
    <div className="p-6">
      {openBook ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{openBook.title}</h2>
            <Button variant="secondary" onClick={() => setOpenBook(null)}>
              Close Book
            </Button>
          </div>

          {/* Page Display with Flip Animation */}
          <div className="relative w-full h-[600px] border shadow-inner overflow-hidden rounded-lg">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPageIndex}
                custom={direction}
                variants={pageFlipVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  transformStyle: "preserve-3d",
                }}
                className="w-full h-full"
              >
                {/* Paper background for each page */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: 'url("/paper.png")' }}
                />

                {openBook.pages[currentPageIndex].items.map((item) => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    onStop={(x, y) => handleDrag(item.id, x, y)}
                  />
                ))}

                {/* Page number indicator */}
                <div className="absolute bottom-4 right-4 bg-white/80 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                  Page {currentPageIndex + 1} of {openBook.pages.length}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add text to this page..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addTextToPage} disabled={!newText.trim()}>
              Add Text
            </Button>
            <div className="flex items-center gap-2 border p-2 rounded bg-white">
              {isUploadingFile ? (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Uploading...
                </span>
              ) : (
                <input
                  type="file"
                  accept="image/*,audio/*"
                  onChange={(e) =>
                    e.target.files && addFileToPage(e.target.files[0])
                  }
                />
              )}
            </div>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={previousPage}
              disabled={currentPageIndex === 0 || isFlipping}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="w-20 text-center"
                value={pageInput}
                onChange={(e) => setPageInput(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const page = Math.max(
                      1,
                      Math.min(openBook.pages.length, pageInput),
                    );
                    goToPage(page - 1);
                  }
                }}
                min={1}
                max={openBook.pages.length}
              />
              <span className="text-sm text-muted-foreground">
                of {openBook.pages.length}
              </span>
            </div>

            <Button
              onClick={nextPage}
              disabled={isFlipping}
              variant="outline"
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={addNewPage}
              disabled={isFlipping}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Page
            </Button>
          </div>

          {/* Page Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {openBook.pages.map((page, index) => (
              <button
                type="button"
                key={page.id ?? `${page.title ?? "page"}-${index}`}
                onClick={() => goToPage(index)}
                disabled={isFlipping}
                className={`flex-shrink-0 w-16 h-20 border-2 rounded-lg p-2 transition-all ${
                  index === currentPageIndex
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 hover:border-gray-300"
                } ${isFlipping ? "opacity-50" : ""}`}
              >
                <div
                  className="w-full h-full rounded flex items-center justify-center text-xs text-muted-foreground bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: 'url("/paper.png")' }}
                >
                  {page.items.length > 0 ? (
                    <div className="text-center bg-white/80 px-2 py-1 rounded">
                      <div className="font-medium">{page.items.length}</div>
                      <div>items</div>
                    </div>
                  ) : (
                    <div className="text-center bg-white/80 px-2 py-1 rounded">
                      <div className="font-medium">Empty</div>
                      <div>page</div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">My Scrapbooks</h1>
            <p className="text-muted-foreground text-sm">
              A digital space for your memories ✨
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="New book title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Button onClick={addBook} disabled={!newTitle.trim()}>
              <BookOpen className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 py-2">
            {books.map((book) => (
              <Card
                key={book.id}
                className="w-48 h-68 cursor-pointer hover:rotate-1 hover:scale-105 transition-transform duration-200"
                onClick={() => {
                  setOpenBook(book);
                  setCurrentPageIndex(0);
                  setPageInput(1);
                }}
              >
                <motion.div
                  className="relative w-full h-full"
                  variants={variants}
                  initial="initial"
                  animate="open"
                  exit="exit"
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                />

                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {book.pages.length} page{book.pages.length !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
