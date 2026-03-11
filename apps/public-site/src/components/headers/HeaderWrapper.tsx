"use client";

import { usePathname } from "next/navigation";
import ClassicHeader from "./ClassicHeader";
import CenteredHeader from "./CenteredHeader";
import TransparentHeader from "./TransparentHeader";

interface Props {
  settings: any;
  navPages: any[];
}

export default function HeaderWrapper({ settings, navPages }: Props) {
  const pathname = usePathname();
  const style = settings.header?.headerStyle || "classic";

  if (style === "centered") {
    return <CenteredHeader settings={settings} navPages={navPages} pathname={pathname} />;
  }
  if (style === "transparent") {
    return <TransparentHeader settings={settings} navPages={navPages} pathname={pathname} />;
  }
  return <ClassicHeader settings={settings} navPages={navPages} pathname={pathname} />;
}
