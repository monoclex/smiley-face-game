// eslint-disable-next-line no-undef
export default function App(): JSX.Element;

// in your theme file that you call `createTheme()`
import { Theme } from '@mui/material/styles';

declare module '@mui/styles' {
  interface DefaultTheme extends Theme {}
}