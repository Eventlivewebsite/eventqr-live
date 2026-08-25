import Card from "../ui/Card";

export default function LoginCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-md">
      {children}
    </Card>
  );
}