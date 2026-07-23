import { useEffect, useState } from "react";

// A minimal starting canvas — header and footer are already wired in via
// SiteLayout, so new pages only need their content dropped in here.
export default function Blanky() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setCount((count) => count + 1);
    }, 1000);
  });

  return <h1>I've rendered {count} times!</h1>;
}
