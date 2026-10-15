const FullPageLoader = () => (
  <div
    role="status"
    className="flex min-h-screen items-center justify-center bg-paper"
  >
    <span className="animate-pulse font-brand text-[48px] font-semibold tracking-[0.01em] text-ink motion-reduce:animate-none">
      Cartevo
    </span>
    <span className="sr-only">Loading</span>
  </div>
);

export default FullPageLoader;
