export function FloatingZalo({ zaloUrl }: { zaloUrl: string }) {
  return (
    <a
      href={zaloUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat với chúng tôi qua Zalo"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-transform hover:scale-105"
    >
      <span className="text-sm font-bold">Zalo</span>
    </a>
  );
}
