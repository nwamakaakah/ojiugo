import { createContext, useContext, useRef, type ReactNode, type RefObject, type ComponentRef } from 'react';
import { View } from 'react-native';
import { BlurTargetView } from 'expo-blur';

// Android can only blur what sits inside a BlurTargetView, so the whole app is wrapped in one and
// every backdrop (dialogs, the share sheet) blurs that.
type Ref = RefObject<ComponentRef<typeof View> | null>;
const Ctx = createContext<Ref | null>(null);
export const useBlurTarget = () => useContext(Ctx);

/** Holds the ref; sits above anything that shows a blurred backdrop. */
export function BlurTargetProvider({ children }: { children: ReactNode }) {
  const ref = useRef<ComponentRef<typeof View> | null>(null);
  return <Ctx.Provider value={ref}>{children}</Ctx.Provider>;
}

/** The app's screens — what gets blurred behind a modal. */
export function BlurTarget({ children }: { children: ReactNode }) {
  const ref = useContext(Ctx);
  return <BlurTargetView ref={ref ?? undefined} style={{ flex: 1 }} collapsable={false}>{children}</BlurTargetView>;
}
