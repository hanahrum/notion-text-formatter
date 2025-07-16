import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleConvert = () => {
    const lines = input.trim().split("\n");
    const meetings: string[] = [];
    const qaItems: string[] = [];
    const personalItems: string[] = [];

    const getFormattedDate = (dateStr: string): string => {
      if (!dateStr || !/\d{4}\/\d{2}\/\d{2}/.test(dateStr)) return "없음";
      const [, month, day] = dateStr.split("/");
      return `${Number(month)}/${Number(day)}`;
    };

    const extractTime = (str: string): string => {
      const match = str.match(/(오전|오후)\s\d{1,2}:\d{2}/);
      return match ? match[0] : "";
    };

    for (const line of lines) {
      const cols = line.split("\t");
      if (cols.length < 2) continue;

      const workType = cols[0]?.trim();
      const title = cols[1]?.trim();
      const done = cols[2]?.trim();
      const live = cols[3]?.trim();

      if (!title) continue;

      if (!workType || workType === "") {
        const date = getFormattedDate(live);
        qaItems.push(`- ${title} (배포: ${date})`);
      } else if (workType === "회의") {
        const time = extractTime(cols[2] || cols[3] || "");
        if (time) {
          meetings.push(`- ${title} (${time})`);
        } else {
          meetings.push(`- ${title}`);
        }
      } else {
        const date = getFormattedDate(done);
        personalItems.push(`- [${workType}] ${title} (목표일: ${date})`);
      }
    }

    const resultParts: string[] = [];

    if (meetings.length > 0) {
      resultParts.push("<회의>");
      resultParts.push(...meetings, "");
    }

    if (qaItems.length > 0) {
      resultParts.push("<QA 업무>");
      resultParts.push(...qaItems, "");
    }

    if (personalItems.length > 0) {
      resultParts.push("<개인업무>");
      resultParts.push(...personalItems);
    }

    const result = resultParts.join("\n");
    setOutput(result);

    // 클립보드 복사
    navigator.clipboard
      .writeText(result)
      .then(() => {
        alert("변환된 결과가 클립보드에 복사되었습니다.");
      })
      .catch((err) => {
        console.error("클립보드 복사 실패:", err);
        alert("클립보드 복사에 실패했습니다.");
      });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        ※ 노션 표 복사 시, 헤더(첫 줄)가 포함되지 않도록 내용만 드래그하여
        복사해 주세요.
      </p>
      <textarea
        placeholder="여기에 노션 표 데이터를 붙여넣기 해주세요"
        rows={10}
        style={{ width: "100%", marginBottom: "1rem" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={handleConvert}>변환 및 복사</button>
      </div>
      <textarea
        placeholder="변환된 결과가 여기에 표시됩니다"
        rows={10}
        style={{ width: "100%", marginTop: "1rem" }}
        value={output}
        readOnly
      />
    </div>
  );
}

export default App;
