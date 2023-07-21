// import ImportDialog from './components/ImportDialog'
// ParentComponent.js
import { useState } from "react";
import FileUploader from "./components/FileUploader";
import SocialKeyPage from "./components/SocialKeyPage";

interface IniData {
  [section: string]: { [key: string]: string };
}

const App = () => {
  const [iniData, setIniData] = useState<IniData>({});

  // Function to update the parent's state with processed INI data
  const updateIniData = (data: IniData) => {
    setIniData(data);
  };

  // Drop onto = Destination
  const handleDrop = (pageNum: number, buttonNum: number) => {
    console.log(
      "Destination / drop pageNum = " + pageNum + ", buttonNum = " + buttonNum
    );
  };

  // Dropped = Source
  const handleDragEnd = (pageNum: number, buttonNum: number) => {
    console.log(
      "Source / dragend pageNum = " + pageNum + ", buttonNum = " + buttonNum
    );
  };

  const pageNums = Array.from(Array(10), (_, i) => i);

  return (
    <div className="container ms-2">
      <h1>
        SKEd{" "}
        <small>
          <mark>the Social Key Editor</mark>
        </small>
      </h1>
      <FileUploader onIniData={updateIniData} />
      <table>
        <tbody>
          <tr>
            {pageNums.map((pageNum) => (
              <td>
                <SocialKeyPage
                  iniData={iniData}
                  pageNum={pageNum}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                ></SocialKeyPage>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default App;
