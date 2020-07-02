import * as React from "react";
import { useState, useEffect } from "react";
import { Room } from "./Room";
import { Grid,  InputBase, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from '@material-ui/icons/Add';
import { Redirect, Link } from "react-router-dom";
import { api } from '../../isProduction';

const useStyles = makeStyles({
  input: {
    textAlign: 'center',
  },
  paddingStyle: {
    // https://material-ui.com/components/grid/#negative-margin
    padding: /* spacing */ (3 * /* 8 pixels */ 8) /* negative margin #2 '... apply at least half ...' */ / 2,
  },
});

interface LobbyProps {}

// TODO: import from libcore
interface GamePreview {
  id: string;
  playerCount: number;
}

const Lobby: React.FC<LobbyProps> = (props) => {
  const styles = useStyles();

  const [rooms, setRooms] = useState<GamePreview[] | null>(null);
  const [input, setInput] = useState<string>('smiley-face-game');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    fetch(api.lobby())
      .then((response) => response.json())
      .then(setRooms);
  }, []);

  // https://stackoverflow.com/a/35354844/3780113
  if (redirect) {
    return <Redirect to={`/games/${input}`} />;
  }

  if (rooms === null) {
    return <h1>Loading rooms</h1>;
  }

  const onInputChange = (input: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(input.target.value);
  };

  const openGame = () => {
    setRedirect(true);
  };

  return (
    <>
      <Grid container item justify="center" alignItems="center">
          <InputBase
            className={styles.input}
            placeholder="Enter World Name"
            onChange={onInputChange}
          />
          <IconButton onClick={openGame}>
            <AddIcon />
          </IconButton>
      </Grid>
      <div className={styles.paddingStyle}>
        <Grid container spacing={3} justify="center" alignItems="flex-start">
          {rooms.map((room) => (
              <Grid item xs={3}>
                <Link to={`/games/${room.id}`}>
                  <Room room={room} />
                </Link>
              </Grid>
            ))}
        </Grid>
      </div>
    </>
  );
};

export default Lobby;
