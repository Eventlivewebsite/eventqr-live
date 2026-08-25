export default function AuthBackground() {
  return (
    <>
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-pink-500/20 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-blue-500/20 blur-[140px]" />

      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[180px]" />
    </>
  );
}