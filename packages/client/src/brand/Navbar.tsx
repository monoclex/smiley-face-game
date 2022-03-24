import { Typography } from "@mui/material";
import LogoutIcon from "@/ui/icons/LogoutIcon";
import React from "react";
import styles from "./navbar.scss";
import { Earth, Cart, ControllerClassic, Newspaper } from "mdi-material-ui";
import { useNavigateTo } from "@/hooks";
import { NavigateFunction, useNavigate as useNavigateReal } from "react-router";
import { useSetToken } from "@/ui/hooks";
import { useSnackbar } from "notistack";

function useLogout(navigate: NavigateFunction) {
  const setToken = useSetToken();
  const { enqueueSnackbar } = useSnackbar();

  return () => {
    setToken(false);

    enqueueSnackbar("Logged out!", {
      variant: "success",
      autoHideDuration: 3000,
    });

    navigate("/");
  };
}

export default function Navbar() {
  const navigate = useNavigateTo();
  const navigateReal = useNavigateReal();

  const logout = useLogout(navigate);

  // we don't want to trigger fading crud
  // TODO: major cleanup on this lobby scroll stuff idkidk
  const lobby = () => navigateReal("/lobby");
  const shop = () => navigateReal("/shop");
  const settings = () => navigateReal("/controls");
  const news = () => navigateReal("/news");

  return (
    <div className={styles.navbar}>
      <Typography className={styles.primaryItem} variant="h2">
        sfg
      </Typography>

      <NavButton onClick={logout} icon={LogoutIcon} text={"logout"} />
      <NavButton onClick={lobby} icon={Earth} text={"lobby"} />
      <NavButton onClick={shop} icon={Cart} text={"shop"} />
      <NavButton onClick={settings} icon={ControllerClassic} text={"settings"} />
      <NavButton onClick={news} icon={Newspaper} text={"news"} />
    </div>
  );
}

interface NavButtonProps {
  // eslint-disable-next-line no-undef
  icon: () => JSX.Element;
  text: string;
  onClick: () => void;
}

function NavButton({ icon: Icon, text, onClick }: NavButtonProps) {
  return (
    <div className={styles.item} onClick={onClick}>
      <Icon />
      <Typography variant="h4">{text}</Typography>
    </div>
  );
}
