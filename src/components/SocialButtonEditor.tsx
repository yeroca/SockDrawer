import { useCallback, useReducer, useEffect, useState } from "react";

import IniData from "../IniData";
import SocialButtonData from "../SocialButtonData";
import HotButtonData from "../HotButtonData";
import { HotButtonLoc, SocialButtonLoc } from "../ButtonTypes";
import {
  lengthExceedsLimit,
  loadSocialButtonData,
} from "../utils/socialButtonDataUtils";

import LimitedTextarea from "./LimitedTextarea";
import TextInput from "./TextInput";
import { onLinkedHotButtons } from "../utils/hotButtonDataUtils";

import { Button, Form, Col, Modal, Row, Table } from "react-bootstrap";
import ColorSelector from "./ColorSelector";
import { colors } from "../utils/colors";
import { altActName } from "../utils/altAct";
import PasteJSONBox from "./PasteJSONBox";
import CopyButton from "./CopyButton";
import copyIniData from "../utils/copyIniData";
import {
  pageButtonToColorKey,
  pageButtonToHotButtonIndex,
  pageButtonToKeyPrefix,
  pageButtonToNameKey,
} from "../utils/pageButtonUtils";

const hotBarToKey = (hotBarNum: number): string => {
  return "HotButtons" + (hotBarNum === 1 ? "" : hotBarNum);
};

const hotBarNumbers = Array.from(Array(11), (_, idx) => idx + 1);
const hotPageNumbers = Array.from(Array(10), (_, idx) => idx + 1);
const hotButtonNumbers = Array.from(Array(12), (_, idx) => idx + 1);

const hotButtonValueToSocialButtonLoc = (value: string): SocialButtonLoc | null => {
  const match = value.match(/^E([0-9]+)(?:,.*)?$/);
  if (!match) return null;

  const index = Number(match[1]);
  if (!Number.isFinite(index)) return null;

  return {
    pageNum: Math.floor(index / 12) + 1,
    buttonNum: (index % 12) + 1,
  };
};

const hotButtonDisplayValue = (
  value: string,
  iniData: IniData
): { text: string; isOccupied: boolean; textColor?: string } => {
  if (!value) return { text: "", isOccupied: false };

  const socialButtonLoc = hotButtonValueToSocialButtonLoc(value);
  if (!socialButtonLoc) return { text: "occupied", isOccupied: true };

  const nameKey = pageButtonToNameKey(socialButtonLoc);
  const colorKey = pageButtonToColorKey(socialButtonLoc);
  const section = iniData.Socials;
  const name = section && nameKey in section ? section[nameKey] : "";
  const colorValue = section && colorKey in section ? section[colorKey] : "";
  const textColor = colorValue ? colors[Number(colorValue)] ?? colorValue : undefined;

  return {
    text: name || "occupied",
    isOccupied: !name,
    textColor,
  };
};

type SocialButtonAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_COLOR"; payload: string }
  | { type: "SET_LINES"; payload: string[] };

const socialButtonReducer = (
  state: SocialButtonData,
  action: SocialButtonAction
): SocialButtonData => {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_COLOR":
      return { ...state, color: action.payload };
    case "SET_LINES":
      return { ...state, lines: action.payload };
    default:
      return state;
  }
};

interface SocialButtonEditorProps {
  iniData: IniData;
  buttonLoc: SocialButtonLoc;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  onHide: () => void;
  onClickAccept: (
    buttonLoc: SocialButtonLoc,
    socialButtonData: SocialButtonData,
    draftIniData: IniData
  ) => void;
}

const SocialButtonEditor: React.FC<SocialButtonEditorProps> = ({
  iniData,
  buttonLoc,
  showModal,
  setShowModal,
  onHide,
  onClickAccept,
}) => {
  const [socialButtonData, dispatch] = useReducer(socialButtonReducer, {
    name: "",
    color: "",
    lines: ["", "", "", "", ""],
  });
  const [linkedHotButtons, setLinkedHotButtons] = useState<HotButtonData[]>([]);
  const [selectedBar, setSelectedBar] = useState<number>(1);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [allowOverwrite, setAllowOverwrite] = useState<boolean>(false);
  const [originalHotButtonAssignments, setOriginalHotButtonAssignments] =
    useState<Record<string, string>>({});
  const [draftIniData, setDraftIniData] = useState<IniData>(() =>
    copyIniData(iniData)
  );

  useEffect(() => {
    // Load initial data from loadSocialButtonData when component mounts
    const initialData = loadSocialButtonData(buttonLoc, iniData);
    const initialDraftIniData = copyIniData(iniData);
    setDraftIniData(initialDraftIniData);
    dispatch({ type: "SET_NAME", payload: initialData.name });
    dispatch({ type: "SET_COLOR", payload: initialData.color });
    dispatch({ type: "SET_LINES", payload: initialData.lines });

    const nextLinkedHotButtons: HotButtonData[] = [];
    onLinkedHotButtons(
      buttonLoc,
      (button: HotButtonLoc, suffix: string) => {
        nextLinkedHotButtons.push({ hotButtonLoc: button, suffix });
      },
      initialDraftIniData
    );

    if (nextLinkedHotButtons.length > 0) {
      const defaultHotButton = nextLinkedHotButtons[0].hotButtonLoc;
      setSelectedBar(defaultHotButton.barNum);
      setSelectedPage(defaultHotButton.pageNum);
    } else {
      setSelectedBar(1);
      setSelectedPage(1);
    }
    setLinkedHotButtons(nextLinkedHotButtons);
    setOriginalHotButtonAssignments({});
    setAllowOverwrite(false);
  }, [buttonLoc, iniData, showModal]);

  // Memoized callbacks to update the corresponding state properties
  const handleNameChange = useCallback((newValue: string) => {
    dispatch({ type: "SET_NAME", payload: newValue });
  }, []);

  const handleTextareaChange = useCallback((newValue: string) => {
    dispatch({ type: "SET_LINES", payload: newValue.split("\n") });
  }, []);

  const handleClearFields = () => {
    dispatch({ type: "SET_NAME", payload: "" });
    dispatch({ type: "SET_COLOR", payload: "" });
    dispatch({ type: "SET_LINES", payload: ["", "", "", "", ""] });
  };

  const handleClickAccept = () => {
    onClickAccept(buttonLoc, socialButtonData, draftIniData);
    setShowModal(false);
  };

  const handleAddAltActNotes = () => {
    const altActRe =
      /^(?<prefix>[ \t]*(\/(pause|timer)[ \t]+[0-9]+[ \t]*,[ \t]*)?\/alt[a-z]*[ \t]+act[a-z]*[ \t]+)(?<code>[0-9]+)([ \t]|$)/;

    for (let i = 0; i < socialButtonData.lines.length; i++) {
      const match = socialButtonData.lines[i].match(altActRe);
      if (match) {
        if (match.groups) {
          const code: string = match.groups.code;
          socialButtonData.lines[i] =
            match.groups.prefix +
            code +
            " # " +
            (code in altActName ? altActName[code] : "unknown code");
        }
      }
      dispatch({ type: "SET_LINES", payload: socialButtonData.lines });
    }
  };

  const handleSelectColor = (color: number) => {
    dispatch({ type: "SET_COLOR", payload: color.toString() });
  };

  const handlePaste = (jsonData: string) => {
    // Process the pasted JSON data
    console.log("Pasted JSON data:", jsonData);
    try {
      const socialButtonData: SocialButtonData = JSON.parse(jsonData);

      if (
        "color" in socialButtonData &&
        "name" in socialButtonData &&
        "lines" in socialButtonData
      ) {
        dispatch({ type: "SET_NAME", payload: socialButtonData.name });
        dispatch({ type: "SET_COLOR", payload: socialButtonData.color });
        dispatch({ type: "SET_LINES", payload: socialButtonData.lines });
      } else {
        alert(
          "Pasted button data is incomplete.  Please double check your clipboard contents."
        );
      }
    } catch {
      alert(
        "Pasted button data has wrong format.  Please double check your clipboard contents."
      );
    }
  };

  const handleHotButtonListClick = (hotButtonLoc: HotButtonLoc) => {
    setSelectedBar(hotButtonLoc.barNum);
    setSelectedPage(hotButtonLoc.pageNum);
    setAllowOverwrite(false);
  };

  const handleAssignToHotButton = (buttonNum: number) => {
    const assignmentValue = "E" + pageButtonToHotButtonIndex(buttonLoc);
    const targetKey = pageButtonToKeyPrefix({
      pageNum: selectedPage,
      buttonNum: buttonNum,
    });
    const barKey = hotBarToKey(selectedBar);
    const slotKey = `${selectedBar}:${selectedPage}:${buttonNum}`;

    const nextDraftIniData = copyIniData(draftIniData);
    if (!(barKey in nextDraftIniData)) {
      nextDraftIniData[barKey] = {};
    }

    const existingValue =
      targetKey in nextDraftIniData[barKey]
        ? nextDraftIniData[barKey][targetKey]
        : "";
    const trimmedExistingValue = (existingValue ?? "").trim();
    const isCurrentAssignment = trimmedExistingValue === assignmentValue;

    if (isCurrentAssignment) {
      const originalValue = originalHotButtonAssignments[slotKey] ?? "";
      nextDraftIniData[barKey][targetKey] = originalValue;
      setDraftIniData(nextDraftIniData);
      setOriginalHotButtonAssignments((currentAssignments) => {
        const nextAssignments = { ...currentAssignments };
        delete nextAssignments[slotKey];
        return nextAssignments;
      });
      setLinkedHotButtons([]);
      onLinkedHotButtons(
        buttonLoc,
        (button: HotButtonLoc, suffix: string) => {
          setLinkedHotButtons((current) => [...current, { hotButtonLoc: button, suffix }]);
        },
        nextDraftIniData
      );
      return;
    }

    if (
      trimmedExistingValue &&
      trimmedExistingValue !== assignmentValue &&
      !allowOverwrite
    ) {
      alert(
        "That hot button is already assigned. Check \"Allow overwrite\" to replace it."
      );
      return;
    }

    setOriginalHotButtonAssignments((currentAssignments) => ({
      ...currentAssignments,
      [slotKey]: trimmedExistingValue,
    }));

    nextDraftIniData[barKey][targetKey] = assignmentValue;
    setDraftIniData(nextDraftIniData);
    setLinkedHotButtons([]);
    onLinkedHotButtons(
      buttonLoc,
      (button: HotButtonLoc, suffix: string) => {
        setLinkedHotButtons((current) => [...current, { hotButtonLoc: button, suffix }]);
      },
      nextDraftIniData
    );
  };

  const handleClearHotButton = (buttonNum: number) => {
    const targetKey = pageButtonToKeyPrefix({
      pageNum: selectedPage,
      buttonNum,
    });
    const barKey = hotBarToKey(selectedBar);

    const nextDraftIniData = copyIniData(draftIniData);
    if (barKey in nextDraftIniData && targetKey in nextDraftIniData[barKey]) {
      delete nextDraftIniData[barKey][targetKey];
    }
    setDraftIniData(nextDraftIniData);

    setOriginalHotButtonAssignments((currentAssignments) => {
      const nextAssignments = { ...currentAssignments };
      delete nextAssignments[`${selectedBar}:${selectedPage}:${buttonNum}`];
      return nextAssignments;
    });
    setLinkedHotButtons([]);
    onLinkedHotButtons(
      buttonLoc,
      (button: HotButtonLoc, suffix: string) => {
        setLinkedHotButtons((current) => [...current, { hotButtonLoc: button, suffix }]);
      },
      nextDraftIniData
    );
  };

  const color: string = socialButtonData.color
    ? colors[parseInt(socialButtonData.color)]
    : colors[0];

  const hotButtonPageValues = hotButtonNumbers.map((buttonNum) => {
    const hotButtonKey = pageButtonToKeyPrefix({
      pageNum: selectedPage,
      buttonNum: buttonNum,
    });
    const barKey = hotBarToKey(selectedBar);
    const value =
      barKey in draftIniData && hotButtonKey in draftIniData[barKey]
        ? draftIniData[barKey][hotButtonKey]
        : "";

    const display = hotButtonDisplayValue(value, draftIniData);

    const trimmedValue = (value ?? "").trim();

    return {
      buttonNum,
      value,
      displayText: display.text,
      isOccupied: display.isOccupied,
      textColor: display.textColor,
      isCurrentAssignment: trimmedValue === "E" + pageButtonToHotButtonIndex(buttonLoc),
      isOccupiedByOtherAssignment:
        trimmedValue !== "" &&
        trimmedValue !== "E" + pageButtonToHotButtonIndex(buttonLoc),
    };
  });

  return (
    <Modal
      show={showModal}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop={true}
      keyboard={true}
      onHide={onHide}
    >
      <Modal.Header closeButton onHide={onHide}>
        <Modal.Title id="contained-modal-title-vcenter">
          Social Button Editor
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="g-3">
            <Col lg={7}>
              <Row sm="auto">
                <Col md={3}>
                  <ColorSelector onSelectColor={handleSelectColor} />
                </Col>
                <Col md={3}>
                  <CopyButton
                    jsonString={JSON.stringify(socialButtonData, null, 2)}
                  />
                </Col>
                <Col md={5}>
                  <PasteJSONBox onPaste={handlePaste} />
                </Col>
              </Row>
              <TextInput
                value={socialButtonData.name}
                onUpdate={handleNameChange}
                color={color}
              />
              <LimitedTextarea
                maxLength={2000}
                value={socialButtonData.lines.join("\n")}
                onChange={handleTextareaChange}
              />
            </Col>
            <Col lg={5}>
              <Table bordered hover striped size="sm">
                <thead className="text-center">
                  <tr key="hbh1">
                    <th key="hbh1t" colSpan={3}>
                      On hot buttons
                    </th>
                  </tr>
                  <tr key="hbh2">
                    <th key="hbh2bar">Bar</th>
                    <th key="hbh2page">Page</th>
                    <th key="hbh2button">Button</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {linkedHotButtons.length === 0 && (
                    <tr key="hbbr-empty">
                      <td key="hbbd-empty" colSpan={3}>
                        <i>- none -</i>
                      </td>
                    </tr>
                  )}
                  {linkedHotButtons.length > 0 &&
                    linkedHotButtons.map((hotButton, idx) => (
                      <tr
                        key={"hbbr" + idx}
                        onClick={() => handleHotButtonListClick(hotButton.hotButtonLoc)}
                        style={{ cursor: "pointer" }}
                      >
                        <td key={"hbbd-bar" + idx}>
                          {hotButton.hotButtonLoc.barNum}
                        </td>
                        <td key={"hbbd-page" + idx}>
                          {hotButton.hotButtonLoc.pageNum}
                        </td>
                        <td key={"hbbd-button" + idx}>
                          {hotButton.hotButtonLoc.buttonNum}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col xs={12}>
              <div className="mb-3">
                <Form.Group as={Row} className="align-items-center g-2">
                  <Form.Label column sm="auto">
                    Bar
                  </Form.Label>
                  <Col sm={2}>
                    <Form.Select
                      value={selectedBar}
                      onChange={(event) => setSelectedBar(Number(event.target.value))}
                    >
                      {hotBarNumbers.map((barNum) => (
                        <option key={barNum} value={barNum}>
                          {barNum}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Form.Label column sm="auto">
                    Page
                  </Form.Label>
                  <Col sm={2}>
                    <Form.Select
                      value={selectedPage}
                      onChange={(event) => setSelectedPage(Number(event.target.value))}
                    >
                      {hotPageNumbers.map((pageNum) => (
                        <option key={pageNum} value={pageNum}>
                          {pageNum}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Form.Group>
              </div>

              <Form.Check
                type="checkbox"
                label="Allow overwrite"
                checked={allowOverwrite}
                onChange={(event) => setAllowOverwrite(event.target.checked)}
                className="mb-3"
              />

              <div
                className="d-grid gap-2"
                style={{ gridTemplateColumns: "repeat(6, 90px)" }}
              >
                {hotButtonPageValues.map(
                  ({
                    buttonNum,
                    displayText,
                    isCurrentAssignment,
                    isOccupiedByOtherAssignment,
                    isOccupied,
                    textColor,
                  }) => (
                    <div
                      key={buttonNum}
                      className="d-flex flex-column align-items-center gap-1"
                      style={{ width: "90px" }}
                    >
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={isOccupiedByOtherAssignment && !allowOverwrite}
                        onClick={() => handleAssignToHotButton(buttonNum)}
                        title={displayText || "empty"}
                        style={{
                          width: "90px",
                          height: "90px",
                          minWidth: "90px",
                          minHeight: "90px",
                          padding: "6px",
                          borderWidth: isCurrentAssignment ? "2px" : "1px",
                          fontWeight: isCurrentAssignment ? 700 : 400,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflow: "hidden",
                          lineHeight: 1.2,
                          color: textColor,
                        }}
                      >
                        {isOccupied ? (
                          <i style={{ color: textColor }}>{displayText}</i>
                        ) : displayText ? (
                          displayText
                        ) : (
                          "empty"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleClearHotButton(buttonNum)}
                        title={`Clear hot button ${buttonNum}`}
                        style={{ width: "90px" }}
                      >
                        Clear
                      </Button>
                    </div>
                  )
                )}
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button onClick={handleClearFields}>Clear</Button>
        <Button onClick={handleAddAltActNotes}>Add notes to /alt act</Button>
        <Button
          disabled={lengthExceedsLimit(socialButtonData.lines)}
          onClick={handleClickAccept}
        >
          Accept
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SocialButtonEditor;
