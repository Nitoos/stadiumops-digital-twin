import { create } from "zustand";
import type { FanPlan } from "./types";

type State = {
  fanId: string;
  plan: FanPlan | null;
  setFanId: (id: string) => void;
  setPlan: (p: FanPlan) => void;
};

export const useStore = create<State>((set) => ({
  fanId: "",
  plan: null,
  setFanId: (id) => set({ fanId: id }),
  setPlan: (p) => set({ plan: p }),
}));
