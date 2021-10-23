import GenericAuthenticationPage from "../../ui/components/GenericAuthenticationPage";
import urlPlayer from "../../assets/mmmyep.png";
import { auth } from "@smiley-face-game/api";
import { useHistory } from "react-router";
import { tokenGlobal } from "../../state";

const GuestPage = () => {
  const history = useHistory();
  return (
    <GenericAuthenticationPage
      smileyUrl={urlPlayer}
      inputs={[{ name: "username", text: (value) => (!value ? "Enter your preferred username" : `Hello, ${value}!`) }]}
      submit={({ username }) =>
        auth({ username }).then(({ token }) => {
          tokenGlobal.set(token);
          history.push("/lobby");
        })
      }
    />
  );
};

export default GuestPage;
