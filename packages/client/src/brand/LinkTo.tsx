// taken from https://github.com/remix-run/react-router/blob/main/packages/react-router-dom/index.tsx for the most part
// just a little bit of code to handle before navigation
import { runCallbacks } from "@/hooks/useNavigateTo";
import React from "react";
import { LinkProps, useHref, useLinkClickHandler } from "react-router-dom";

const LinkTo = React.forwardRef<HTMLAnchorElement, LinkProps>(function LinkWithRef(
  { onClick, reloadDocument, replace = false, state, target, to, ...rest },
  ref
) {
  const href = useHref(to);
  const internalOnClick = useLinkClickHandler(to, { replace, state, target });
  function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented && !reloadDocument) {
      event.preventDefault();
      runCallbacks().then(() => internalOnClick(event));
    }
  }

  return <a {...rest} href={href} onClick={handleClick} ref={ref} target={target} />;
});

export default LinkTo;
