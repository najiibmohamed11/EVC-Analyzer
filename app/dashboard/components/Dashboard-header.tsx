import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const navigation = useRouter();
  const logOut = () => {
    localStorage.removeItem("transactions");
    navigation.push("/");
  };
  return (
    <header className="flex items-center justify-between py-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={logOut}
        >
          <LogOut className="h-5 w-5 text-slate-600" />
        </Button>
      </div>
    </header>
  );
}
