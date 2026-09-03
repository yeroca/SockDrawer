import { useState, useEffect } from "react";

import FileUploader from "../components/FileUploader";
import SocialButtonPage from "../components/SocialButtonPage";
import IniData from "../IniData";
import FileDownloader from "../components/FileDownloader";
import HotButtonData from "../HotButtonData";
import Alert from "../components/Alert";
import SocialButtonEditor from "../components/SocialButtonEditor";

import { SocialButtonLoc, HotButtonLoc } from "../ButtonTypes";
import {
  loadSocialButtonData,
  storeSocialButtonData,
} from "../utils/socialButtonDataUtils";
import {
  linkHotButtonToSocialButton,
  onLinkedHotButtons,
} from "../utils/hotButtonDataUtils";
import copyString from "../utils/copyString";
import copyIniData from "../utils/copyIniData";

import { Container } from "react-bootstrap";
import SocialButtonData from "../SocialButtonData";
import { WindowSize } from "../WindowSize";

//import dumpHash from "./utils/dumpHash";

const pageNums = Array.from(Array(10), (_, i) => i + 1);

interface HomeProps {
  iniData: IniData;
  setIniData: (iniData: IniData) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
}

const Home: React.FC<HomeProps> = ({
  iniData,
  setIniData,
  fileName,
  setFileName,
}) => {
  const [editSocialButtonLoc, setEditSocialButtonLoc] =
    useState<SocialButtonLoc>({ pageNum: 0, buttonNum: 0 });

  const [showSocialButtonEditorModal, setShowSocialButtonEditorModal] =
    useState<boolean>(false);

  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleWindowResize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  // Effect to add event listener for window resize and cleanup
  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const [srcSocialButtonLoc, setSrcSocialButtonLoc] = useState<SocialButtonLoc>(
    {
      pageNum: -1,
      buttonNum: -1,
    }
  );

  const [dstSocialButtonLoc, setDstSocialButtonLoc] = useState<SocialButtonLoc>(
    {
      pageNum: -1,
      buttonNum: -1,
    }
  );

  const performAction = (
    srcButton: SocialButtonLoc,
    dstButton: SocialButtonLoc
  ) => {
    const linkedSrcHotButtons: HotButtonData[] = [];
    const linkedDstHotButtons: HotButtonData[] = [];

    /*
    console.log(
      "Action src: " +
        JSON.stringify(srcButton) +
        "  dst: " +
        JSON.stringify(dstButton)
    );
    */
    onLinkedHotButtons(
      srcButton,
      (button: HotButtonLoc, suffix: string) => {
        linkedSrcHotButtons.push({ hotButtonLoc: button, suffix: suffix });
      },
      iniData
    );
    onLinkedHotButtons(
      dstButton,
      (button: HotButtonLoc, suffix: string) => {
        linkedDstHotButtons.push({ hotButtonLoc: button, suffix: suffix });
      },
      iniData
    );

    // swap the social key data

    const newIniData = copyIniData(iniData);

    const srcButtonData = loadSocialButtonData(srcButton, newIniData);
    //console.log("src: " + JSON.stringify(srcButtonData));
    const dstButtonData = loadSocialButtonData(dstButton, newIniData);

    storeSocialButtonData(srcButton, dstButtonData, newIniData);
    storeSocialButtonData(dstButton, srcButtonData, newIniData);

    // Fix the hot buttons
    //console.log("linkedSrctHotButtons: " + JSON.stringify(linkedSrcHotButtons));
    for (let linkedSrcHotButton of linkedSrcHotButtons) {
      /*
      console.log(
        "linking " +
          JSON.stringify(linkedSrcHotButton) +
          " to " +
          JSON.stringify(dstButton)
      );
      */
      linkHotButtonToSocialButton(linkedSrcHotButton, dstButton, newIniData);
    }
    //console.log("linkedDstHotButtons: " + JSON.stringify(linkedDstHotButtons));
    for (let linkedDstHotButton of linkedDstHotButtons) {
      /*
      console.log(
        "linking " +
          JSON.stringify(linkedDstHotButton) +
          " to " +
          JSON.stringify(srcButton)
      );
      */
      linkHotButtonToSocialButton(linkedDstHotButton, srcButton, newIniData);
    }

    setIniData(newIniData);
  };

  // Drop onto = Destination
  const handleDrop = (buttonLoc: SocialButtonLoc) => {
    setDstSocialButtonLoc(() => {
      if (srcSocialButtonLoc.pageNum !== -1) {
        // This is the second event, so we know that both the source and destination are set
        performAction(srcSocialButtonLoc, buttonLoc);
        setDstSocialButtonLoc({ pageNum: -1, buttonNum: -1 });
      }
      return buttonLoc;
    });
  };

  // Dropped = Source
  const handleDragEnd = (buttonLoc: SocialButtonLoc) => {
    setSrcSocialButtonLoc(() => {
      if (dstSocialButtonLoc.pageNum !== -1) {
        // This is the second event, so we know that both the source and destination are set
        performAction(buttonLoc, dstSocialButtonLoc);
        setSrcSocialButtonLoc({ pageNum: -1, buttonNum: -1 });
      }
      return buttonLoc;
    });
  };

  //
  const handleDoubleClick = (buttonLoc: SocialButtonLoc) => {
    setEditSocialButtonLoc(buttonLoc);
    setShowSocialButtonEditorModal(true);
  };

  const fileNameHandler = (name: string) => {
    const newName: string = copyString(name);
    setFileName(newName);
  };

  const handleClickAccept = (
    buttonLoc: SocialButtonLoc,
    socialButtonData: SocialButtonData,
    draftIniData: IniData
  ): void => {
    const newIniData = copyIniData(draftIniData);
    storeSocialButtonData(buttonLoc, socialButtonData, newIniData);
    setIniData(newIniData);
  };

  /*
  const openExternalLinkInNewTab = (url: string) => {
    // Create a new window/tab with the external link
    const newWindow = window.open(url, "_blank");
    // Add noopener and noreferrer attributes to improve security
    if (newWindow) newWindow.opener = null;
  };
*/
  return (
    <>
      <Container fluid className="ms-2">
        <FileUploader onIniData={setIniData} onFileName={fileNameHandler} />
        <table>
          <thead>
            <tr key={0}>
              <th style={{ textAlign: "center" }} colSpan={10}>
                {fileName}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr key={1}>
              {pageNums.map((pageNum) => (
                <td key={pageNum}>
                  <SocialButtonPage
                    iniData={iniData}
                    pageNum={pageNum}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onDoubleClick={handleDoubleClick}
                    windowSize={windowSize}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <Alert message="Make a backup copy of your original .ini file before using the one created here" />
        <FileDownloader iniData={iniData} fileName={fileName} />
      </Container>
      <SocialButtonEditor
        iniData={iniData}
        buttonLoc={editSocialButtonLoc}
        showModal={showSocialButtonEditorModal}
        setShowModal={setShowSocialButtonEditorModal}
        onHide={() => setShowSocialButtonEditorModal(false)}
        onClickAccept={handleClickAccept}
      />
    </>
  );
};

export default Home;
