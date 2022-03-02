import React, { ReactNode, useEffect, useState, useRef } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Paper,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import LogoutIcon from "../icons/LogoutIcon";
import { useNavigate } from "react-router";
import { useControlBindings, ControlKey, updateBinding, Controls, Control } from "../../controls";

export default function ControlsPage() {
  return (
    <>
      <TitleBar>
        <BackButton />
        <Title>Controls</Title>
      </TitleBar>
      <ConnectedControlsTable />
    </>
  );
}

function ConnectedControlsTable() {
  const [controls, setControls] = useControlBindings();
  const [wipKey, setWipKey] = useState<undefined | ControlKey>(undefined);

  const onClick = (key: ControlKey) => {
    console.log("clicked", key);
    setWipKey(key);
  };

  useEffect(() => {
    if (!wipKey) return;

    const handler = (event: KeyboardEvent) => {
      setWipKey(undefined);
      setControls((controls) => updateBinding(controls, wipKey, event.key.toLowerCase()));
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [wipKey]);

  let tableControls = controls;

  if (wipKey) {
    tableControls = updateBinding(tableControls, wipKey, "Press a key...");
  }

  return <ControlsTable controls={tableControls} onClick={onClick} />;
}

interface ChildrenProps {
  children: ReactNode;
}

const TitleBox = styled(Box)({ flexGrow: 1, paddingBottom: "4em", marginBottom: "1em" });
function TitleBar({ children }: ChildrenProps) {
  return (
    <TitleBox>
      <AppBar position="fixed">
        <Toolbar>{children}</Toolbar>
      </AppBar>
    </TitleBox>
  );
}

const TitleTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  paddingLeft: theme.spacing(1),
}));

function Title({ children }: ChildrenProps) {
  return <TitleTypography variant="h6">{children}</TitleTypography>;
}

const PrimaryIconButton = styled(IconButton)({ marginRight: 2 });
function BackButton() {
  const navigate = useNavigate();
  const goToLobby = () => navigate("/lobby");

  return (
    <PrimaryIconButton size="large" edge="start" onClick={goToLobby}>
      <LogoutIcon />
    </PrimaryIconButton>
  );
}

interface ControlsTableProps<K extends string> {
  controls: Controls<K>;
  onClick: (control: K) => void;
}

const isElementAfterCurrentElement = (currentElement: number, totalElements: number) =>
  currentElement < totalElements - 1;

function ControlsTable<K extends string>({ controls, onClick }: ControlsTableProps<K>) {
  return (
    <Table>
      {iterateRecord(controls).map(([key, value], index, array) => (
        <>
          <FilledControlEntry key={key} keyboardKey={key} control={value} onClick={onClick} />
          {isElementAfterCurrentElement(index, array.length) && (
            <SoftDivider key={key + "-divider"} />
          )}
        </>
      ))}
    </Table>
  );
}

interface FilledControlEntryProps<K extends string> {
  keyboardKey: K;
  control: Control;
  onClick: (control: K) => void;
}

function FilledControlEntry<K extends string>({
  keyboardKey,
  control,
  onClick,
}: FilledControlEntryProps<K>) {
  return (
    <ControlEntry>
      <ControlEntryName>{control.name}</ControlEntryName>
      <ControlEntryBinding onClick={() => onClick(keyboardKey)}>
        {formatKeyBindingName(control.binding)}
      </ControlEntryBinding>
    </ControlEntry>
  );
}

function formatKeyBindingName(binding: string): string {
  const upper = binding.toUpperCase();

  if (upper === " ") return "SPACE";
  return upper;
}

function iterateRecord<K extends string | number | symbol, V>(record: Record<K, V>): [K, V][] {
  return Object.entries(record) as [K, V][];
}

const CenteredGrid = styled(Grid)({ margin: "auto", flexGrow: 1, maxWidth: "24em" });
const WidePaper = styled(Paper)({ width: "100%" });
function Table({ children }: ChildrenProps) {
  return (
    <CenteredGrid container>
      <WidePaper>{children}</WidePaper>
    </CenteredGrid>
  );
}

function SoftDivider() {
  return <Divider variant="middle" />;
}

const ControlEntryRoot = styled(Grid)({ padding: "0.5em" });
function ControlEntry({ children }: ChildrenProps) {
  return (
    <ControlEntryRoot item container xs>
      {children}
    </ControlEntryRoot>
  );
}

const ControlEntryNameRoot = styled(Grid)({ padding: "6px" });
function ControlEntryName({ children }: ChildrenProps) {
  return (
    <ControlEntryNameRoot item xs>
      {children}
    </ControlEntryNameRoot>
  );
}

interface ControlEntryBindingProps {
  children: ReactNode;
  onClick: () => void;
}

const FixedWidthButton = styled(Button)({ width: "10em" });
function ControlEntryBinding({ children, onClick }: ControlEntryBindingProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // prevent space bar from triggering button
  const unfocusButton = () => {
    ref.current && ref.current.blur();
  };

  return (
    <Grid item>
      <FixedWidthButton ref={ref} variant="outlined" onClick={onClick} onFocus={unfocusButton}>
        {children}
      </FixedWidthButton>
    </Grid>
  );
}
