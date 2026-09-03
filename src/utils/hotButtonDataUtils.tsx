import { SocialButtonLoc, HotButtonLoc } from "../ButtonTypes";
import HotButtonData from "../HotButtonData";

import {
  pageButtonToHotButtonIndex,
  pageButtonToKeyPrefix,
} from "./pageButtonUtils";

import IniData from "../IniData";

const hotBarToKey = (hotBarNum: number): string => {
  return "HotButtons" + (hotBarNum === 1 ? "" : hotBarNum);
};

const re = /E[0-9]+/;

const onLinkedHotButtons = (
  socialButton: SocialButtonLoc,
  operation: (hotButton: HotButtonLoc, suffix: string) => void,
  iniData: IniData,
): void => {
  const ePrefix = "E" + pageButtonToHotButtonIndex(socialButton);
  for (let hotButtonsBar = 1; hotButtonsBar <= 11; hotButtonsBar++) {
    for (let hotButtonsPage = 1; hotButtonsPage <= 10; hotButtonsPage++) {
      for (
        let hotButtonsButton = 1;
        hotButtonsButton <= 12;
        hotButtonsButton++
      ) {
        let barKey = hotBarToKey(hotButtonsBar);
        if (barKey in iniData) {
          const buttonKey = pageButtonToKeyPrefix({
            pageNum: hotButtonsPage,
            buttonNum: hotButtonsButton,
          });
          if (buttonKey in iniData[barKey]) {
            const value = iniData[barKey][buttonKey];

            if (value.startsWith(ePrefix + ",") || value === ePrefix) {
              //console.log("suffix: " + value.replace(re, ""));
              operation(
                {
                  barNum: hotButtonsBar,
                  pageNum: hotButtonsPage,
                  buttonNum: hotButtonsButton,
                },
                value.replace(re, ""),
              );
            }
          }
        }
      }
    }
  }
};

const linkHotButtonToSocialButton = (
  hotButton: HotButtonData,
  socialButton: SocialButtonLoc,
  iniData: IniData,
): void => {
  //console.log("hb: " + JSON.stringify(hotButton));
  let barKey = hotBarToKey(hotButton.hotButtonLoc.barNum);
  iniData[barKey][pageButtonToKeyPrefix(hotButton.hotButtonLoc)] =
    "E" + pageButtonToHotButtonIndex(socialButton) + hotButton.suffix;
};

export { onLinkedHotButtons, linkHotButtonToSocialButton };
