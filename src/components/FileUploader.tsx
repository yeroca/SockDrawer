// FileUploader.tsx

import IniData from "../IniData";
import ini from "ini";
import Form from "react-bootstrap/Form";

interface FileUploaderProps {
  onIniData: (data: { [section: string]: { [key: string]: string } }) => void;
  onFileName: (name: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onIniData,
  onFileName,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // remove any numbered suffix, like (2)
    const re = / ?\([0-9]+\).ini$/;
    onFileName(file.name.replace(re, ".ini"));
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const content = e.target.result;
        const contentString =
          typeof content == "string"
            ? content
            : new TextDecoder().decode(content);
        const iniData: IniData = ini.decode(contentString);
        onIniData(iniData); // Call the parent's callback with the processed INI data
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Form>
        <Form.Group
          className="mb-3"
          style={{ border: "1px solid #ccc", padding: "10px" }}
        >
          <Form.Label>
            Choose <span style={{ fontStyle: "italic" }}>character_server</span>
            .ini file
          </Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
      </Form>
    </>
  );
};

export default FileUploader;
