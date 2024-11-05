// icons
import { ReactComponent as Plebeian } from "assets/icons/plebeian-title.svg";
import { ReactComponent as August } from "assets/icons/august.svg";
import { ReactComponent as Caesar } from "assets/icons/caesar.svg";
import { ReactComponent as Centurion } from "assets/icons/centurion.svg";
import { ReactComponent as Emperor } from "assets/icons/emperor.svg";
import { ReactComponent as Gladiator } from "assets/icons/gladiator.svg";
import { ReactComponent as King } from "assets/icons/king.svg";
import { ReactComponent as Legionary } from "assets/icons/legionary.svg";
import { ReactComponent as Monarch } from "assets/icons/monarch.svg";
import { ReactComponent as Overlord } from "assets/icons/overlord.svg";

const iconTypes = {
  plebeian: Plebeian,
  august: August,
  caesar: Caesar,
  centurion: Centurion,
  emperor: Emperor,
  gladiator: Gladiator,
  king: King,
  legionary: Legionary,
  monarch: Monarch,
  overlord: Overlord,
};

const TitleIcon = ({ title, ...props }) => {
  if (title) {
    let Icon = iconTypes[title];
    return <Icon {...props} />;
  }

  return <Plebeian {...props} />;
};

export default TitleIcon;
