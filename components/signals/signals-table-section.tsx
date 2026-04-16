import { SignalTable } from "@/components/signal-table";
import { getSignals } from "@/lib/data";

export async function SignalsTableSection() {
  const signals = await getSignals();

  return <SignalTable signals={signals} />;
}
